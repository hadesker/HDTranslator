let RULE_ID_START = 1001;
let rules = [];

userAgentList.forEach(item => {
    item.sites.forEach(site => {
        rules.push({
            'id': RULE_ID_START++,
            'priority': 1,
            'action': {
                'type': 'modifyHeaders',
                'requestHeaders': [{
                    'header': 'User-Agent',
                    'operation': 'set',
                    'value': item.ua
                }]
            },
            'condition': {
                'urlFilter': `||${site}`,
                'resourceTypes': [
                    'main_frame',
                    'sub_frame',
                    'stylesheet',
                    'script',
                    'image',
                    'font',
                    'object',
                    'xmlhttprequest',
                    'ping',
                    'csp_report',
                    'media',
                    'websocket',
                    'webtransport',
                    'webbundle',
                    'other'
                ]
            }
        })
    })
});
!chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map(item => item.id)
});