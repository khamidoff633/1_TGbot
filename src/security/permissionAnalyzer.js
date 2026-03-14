const SUSPICIOUS_PERMISSIONS = [
  'android.permission.READ_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.SEND_SMS',
  'android.permission.BIND_ACCESSIBILITY_SERVICE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.REQUEST_INSTALL_PACKAGES',
  'android.permission.READ_CONTACTS',
  'android.permission.RECORD_AUDIO'
];

function analyzePermissionStrings(text = '') {
  const findings = [];
  for (const perm of SUSPICIOUS_PERMISSIONS) {
    if (text.includes(perm)) findings.push(perm);
  }
  return findings;
}

module.exports = { analyzePermissionStrings, SUSPICIOUS_PERMISSIONS };
