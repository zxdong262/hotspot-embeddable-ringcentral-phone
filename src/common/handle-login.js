/**
 * handle login event
 */

import { ringCentralConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { rc, getPortalId } from './common'

const {
  clientID,
  appServer,
  authServer
} = ringCentralConfigs

export function onTriggerLogin (data) {
  const pid = getPortalId()
  const authUrl = authServer + '/rc-ext-oauth'
  const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=500,height=528,right=20,bottom=20'
  console.log('pid', pid)
  window.open(`${appServer}/restapi/oauth/authorize?redirect_uri=${authUrl}&client_id=${clientID}&response_type=code&state=pid:${pid}&brand_id=&display=&prompt=`, '_blank', params)
}

export function onLoginCallback ({ callbackUri }) {
  rc.postMessage({
    type: 'rc-adapter-authorization-code',
    callbackUri
  })
}
