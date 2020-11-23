module.exports = {
  name: '___ IOC Submission',
  acronym: '___+', // TODO: This will need to be the same acronym as the original integration, if we have one, and a '+' at the end
  description:
    'Polarity integration that connects to the ___ threat intelligence platform using the IOC Submission interface format.',
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
    // TODO: Add other options as needed
    {
      key: 'url',
      name: '___ URL',
      description:
        'URL of your ___ instance to include the schema (i.e., https://) and port if applicable',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'The API (secret) Key associated with the provided Access ID',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'allowDelete',
      name: 'Allow IOC Deletion',
      description: 'If checked, users will be able to delete indicators from ___.',
      default: false,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
