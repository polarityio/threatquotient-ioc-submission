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
    },
    {
      key: 'minimumScore',
      name: 'Minimum Score',
      description:
        'The minimum indicator score required for indicators to be found in search by the integration',
      default: {
        value: '5',
        display: 'Low'
      },
      type: 'select',
      options: [
        {
          value: '100', // the max score in the ThreatQ interface is 10 but the actual max is 100 which is hidden by the server
          display: '10 - Very High'
        },
        {
          value: '9',
          display: '9 - High'
        },
        {
          value: '8',
          display: '8 - Medium'
        },
        {
          value: '7',
          display: '7 - Medium'
        },
        {
          value: '6',
          display: '6 - Low'
        },
        {
          value: '5',
          display: '5 - Low'
        },
        {
          value: '4',
          display: '4 - Very Low'
        },
        {
          value: '3',
          display: '3 - Very Low'
        },
        {
          value: '2',
          display: '2 - Very Low'
        },
        {
          value: '1',
          display: '1 - Very Low'
        },
        {
          value: '0',
          display: '0 - Very Low/Generated Score'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'maximumScore',
      name: 'Maximum Score',
      description:
        'The maximum indicator score required for indicators to be found in search by the integration',
      default: {
        value: '100',
        display: '10 - Very High'
      },
      type: 'select',
      options: [
        {
          value: '100', // the max score in the ThreatQ interface is 10 but the actual max is 100 which is hidden by the server
          display: '10 - Very High'
        },
        {
          value: '9',
          display: '9 - High'
        },
        {
          value: '8',
          display: '8 - Medium'
        },
        {
          value: '7',
          display: '7 - Medium'
        },
        {
          value: '6',
          display: '6 - Low'
        },
        {
          value: '5',
          display: '5 - Low'
        },
        {
          value: '4',
          display: '4 - Very Low'
        },
        {
          value: '3',
          display: '3 - Very Low'
        },
        {
          value: '2',
          display: '2 - Very Low'
        },
        {
          value: '1',
          display: '1 - Very Low'
        },
        {
          value: '0',
          display: '0 - Very Low/Generated Score'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
