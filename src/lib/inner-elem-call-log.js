/**
 * react element in widget wrapper
 */

import { useState, useEffect } from 'react'
import _ from 'lodash'
import CallLogForm from './call-log-form'
import copy from 'json-deep-copy'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { callResultListKey } from '../feat/common'
import getCallResultList from '../feat/get-call-result-list.js'

export default () => {
  const [forms, setStateOri] = useState([])
  const [callResultList, setCallResultList] = useState([])
  function update (id, data) {
    setStateOri(s => {
      const arr = copy(s)
      const ref = _.find(arr, d => d.id === id)
      Object.assign(ref, data)
      return arr
    })
  }
  function remove (id) {
    setStateOri(s => {
      return copy(s).filter(d => d.id !== id)
    })
  }
  function add (obj) {
    setStateOri(s => {
      return [
        ...copy(s),
        obj
      ]
    })
  }
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type, callLogProps } = e.data
    if (type === 'rc-init-call-log-form') {
      add(callLogProps)
    }
  }
  async function init () {
    const callResultList = await getCallResultList()
    console.log('callResultList', callResultList)
    await ls.set(callResultListKey, callResultList)
    setCallResultList(callResultList)
  }
  useEffect(() => {
    init()
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])
  if (!forms.length) {
    return null
  }
  return forms.map(form => {
    return (
      <CallLogForm
        form={form}
        key={form.id}
        update={update}
        callResultList={callResultList}
        remove={remove}
      />
    )
  })
}
