/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {
  popup,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getFullNumber, format164 } from '../common/common'
import { searchPhone } from '../common/search'
import { Modal, Button } from 'antd'
import delay from 'timeout-as-promise'
import copy from 'json-deep-copy'
import { CloseCircleOutlined } from '@ant-design/icons'

async function getContactInfo (call) {
  let phone = call.direction === 'Outbound'
    ? getFullNumber(_.get(call, 'to')) || _.get(call, 'to')
    : getFullNumber(_.get(call, 'from')) || _.get(call, 'from')
  window.rc.currentCall = call
  if (!phone) {
    return
  }
  phone = format164(phone)
  window.rc.currentSearch = searchPhone([phone], true, true)
  const contacts = await window.rc.currentSearch
  if (contacts && contacts.length) {
    window.rc.currentContacts = contacts
  }
  delete window.rc.currentSearch
  const contact = _.get(contacts, '[0]')
  return contact
}

/**
 * show caller/callee info
 * @param {Object} call
 */
export async function showContactInfoPanel (call) {
  if (
    !call ||
    call.telephonyStatus !== 'Ringing'
  ) {
    return
  }
  if (
    call.direction === 'Outbound'
  ) {
    return getContactInfo(call)
  }
  popup()
  const contact = await getContactInfo(call)
  if (!contact) {
    return
  }
  window.rc.currentContact = contact
  const type = 'contact'
  const [pid, id] = contact.split('-')
  const url = `${host}/contacts/${pid}/${type}/${id}`
  const elem = (
    <iframe
      scrolling='no'
      class='rc-contact-frame'
      sandbox='allow-same-origin allow-scripts allow-forms allow-popups'
      allow='microphone'
      src={url}
      id='rc-contact-frame'
    />
  )
  function close () {
    window.incomingCall && window.incomingCall.destroy()
  }
  const title = (
    <div>
      <span>Incoming call</span>
      <Button
        onClick={close}
        icon={<CloseCircleOutlined />}
        className='rc-mg1l'
      >
        Close
      </Button>
    </div>
  )
  const opts = {
    title,
    width: '100%',
    style: {
      height: '100%'
    },
    content: elem
  }
  window.incomingCall = Modal.info(opts)
}
setTimeout(() => {
  showContactInfoPanel({
    call: {
      telephonyStatus: 'Ringing',
      direction: 'fff',
      from: '+12054097374'
    }
  })
}, 5000)

export async function afterCallEnd () {
  window.rc.calling = false
  while (window.rc.currentSearch) {
    await delay(100)
  }
  if (!window.rc.currentContacts) {
    return
  }
  const id = window.rc.currentCall.sessionId
  const note = window.rc.note
  const callLogProps = {
    relatedContacts: copy(window.rc.currentContacts) || [],
    afterCallForm: true,
    id,
    body: {
      call: copy(window.rc.currentCall)
    },
    note
  }
  delete window.rc.currentCall
  delete window.rc.currentContacts
  window.postMessage({
    type: 'rc-init-call-log-form',
    callLogProps
  }, '*')
}
