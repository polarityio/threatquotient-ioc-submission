module.exports = {
  name: 'ThreatQuotient IOC Submission',
  acronym: 'TQ+',
  description:
    'Polarity integration that connects to the ThreatQuotient threat intelligence platform using the IOC Submission interface format.',
  entityTypes: ['domain', 'IPv4', 'IPv6', 'email', 'MD5', 'SHA1', 'SHA256'],
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  summary: {
    component: {
      file: './components/summary.js'
    },
    template: {
      file: './templates/summary.hbs'
    }
  },
  onDemandOnly: true,
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'ThreatQuotient Server URL',
      description:
        'The URL for your ThreatQ server which should include the schema (i.e., http, https) and port if required',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'username',
      name: 'Username',
      description:
        'Your TQ username you want the integration to authenticate as (typically an email address)',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'password',
      name: 'Password',
      description:
        'The password for the provided username you want the integration to authenticate as',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'client',
      name: 'Client ID',
      description:
        'The Client ID for your ThreatQuotient deployment.  (accessible at https://<yourserver>/assets/js/config.js)',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'allowDelete',
      name: 'Allow IOC Deletion',
      description:
        'If checked, users will be able to delete indicators from ThreatQuotient.',
      default: false,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
