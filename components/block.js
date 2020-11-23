polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  maxUniqueKeyNumber: Ember.computed.alias('details.maxUniqueKeyNumber'),
  url: Ember.computed.alias('details.url'),
  // TODO: Submission Options Initial Variables goes here
  foundEntities: [],
  newIocs: [],
  newIocsToSubmit: [],
  selectedTags: [],
  deleteMessage: '',
  deleteErrorMessage: '',
  deleteIsRunning: false,
  isDeleting: false,
  entityToDelete: {},
  createMessage: '',
  createErrorMessage: '',
  createIsRunning: false,
  selectedTag: [],
  editingTags: false,
  maxTagsInBlock: 10,
  interactionDisabled: Ember.computed('isDeleting', 'createIsRunning', function () {
    return this.get('isDeleting') || this.get('createIsRunning');
  }),
  init() {
    this.set(
      'newIocs',
      this.get(`details.notFoundEntities${this.get('maxUniqueKeyNumber')}`)
    );

    this.set(
      'foundEntities',
      this.get(`details.foundEntities${this.get('maxUniqueKeyNumber')}`)
    );

    // TODO Add any other properties here that are either objects or arrays that will be modified in the course of using this integration

    this.set('selectedTags', [
      {
        name: 'Submitted By Polarity'
      }
    ]);
    this._super(...arguments);
  },
  observer: Ember.on(
    'willUpdate',
    Ember.observer('details.maxUniqueKeyNumber', function () {
      if (this.get('maxUniqueKeyNumber') !== this.get('_maxUniqueKeyNumber')) {
        this.set('_maxUniqueKeyNumber', this.get('maxUniqueKeyNumber'));

        this.set(
          'newIocs',
          this.get(`details.notFoundEntities${this.get('maxUniqueKeyNumber')}`)
        );

        this.set(
          'foundEntities',
          this.get(`details.foundEntities${this.get('maxUniqueKeyNumber')}`)
        );

        // TODO Add any other properties here that are either objects or arrays that will be modified in the course of using this integration

        this.set('newIocsToSubmit', []);
      }
    })
  ),
  searchTags: function (term, resolve, reject) {
    const outerThis = this;
    outerThis.set('createMessage', '');
    outerThis.set('createErrorMessage', '');
    outerThis.get('block').notifyPropertyChange('data');

    outerThis
      .sendIntegrationMessage({
        data: {
          action: 'SEARCH_TAGS',
          term,
          selectedTags: this.get('selectedTags')
        }
      })
      .then(({ tags }) => {
        outerThis.set(
          'existingTags',
          [...(term ? [{ name: term, isNew: true }] : [])].concat(tags)
        );
      })
      .catch((err) => {
        outerThis.set(
          'createErrorMessage',
          'Search Tags Failed: ' +
            (err &&
              (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason'
        );
      })
      .finally(() => {
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createMessage', '');
          outerThis.set('createErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        resolve();
      });
  },
  actions: {
    // TODO: Add boolean value toggling action functions here
    initiateItemDeletion: function (entity) {
      this.set('isDeleting', true);
      this.set('entityToDelete', entity);
    },
    cancelItemDeletion: function () {
      this.set('isDeleting', false);
      this.set('entityToDelete', {});
    },
    confirmDelete: function () {
      const outerThis = this;
      outerThis.set('deleteMessage', '');
      outerThis.set('deleteErrorMessage', '');
      outerThis.set('deleteIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'DELETE_ITEM',
            entity: outerThis.get('entityToDelete'),
            newIocs: outerThis.get('newIocs'),
            foundEntities: outerThis.get('foundEntities')
          }
        })
        .then(({ newIocs, newList }) => {
          outerThis.set('newIocs', newIocs);
          outerThis.set('foundEntities', newList);
          outerThis.set('deleteMessage', 'Successfully Deleted IOC');
        })
        .catch((err) => {
          outerThis.set(
            'deleteErrorMessage',
            'Failed to Delete IOC: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('isDeleting', false);
          this.set('entityToDelete', {});
          outerThis.set('deleteIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('deleteMessage', '');
            outerThis.set('deleteErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    removeAllSubmitItems: function () {
      const allIOCs = this.get('newIocs').concat(this.get('newIocsToSubmit'));

      this.set('newIocs', allIOCs);
      this.set('newIocsToSubmit', []);

      this.get('block').notifyPropertyChange('data');
    },
    addAllSubmitItems: function () {
      const allIOCs = this.get('newIocs').concat(this.get('newIocsToSubmit'));

      this.set('newIocs', []);
      this.set('newIocsToSubmit', allIOCs);
      this.get('block').notifyPropertyChange('data');
    },
    removeSubmitItem: function (entity) {
      this.set('newIocs', this.get('newIocs').concat(entity));
      
      this.set(
        'newIocsToSubmit',
        this.get('newIocsToSubmit').filter(({ value }) => value !== entity.value)
      );

      this.get('block').notifyPropertyChange('data');
    },
    addSubmitItem: function (entity) {
      this.set(
        'newIocs',
        this.get('newIocs').filter(({ value }) => value !== entity.value)
      );
      const updatedNewIocsToSubmit = this.get('newIocsToSubmit').concat(entity);

      this.set('newIocsToSubmit', updatedNewIocsToSubmit);

      this.get('block').notifyPropertyChange('data');
    },
    submitItems: function () {
      const outerThis = this;
      const possibleParamErrors = [
        {
          condition: () => !outerThis.get('newIocsToSubmit').length,
          message: 'No Items to Submit...'
        }
        // TODO: add other initially evaluatable error conditions and messages here
      ];

      const paramErrorMessages = possibleParamErrors.reduce(
        (agg, possibleParamError) =>
          possibleParamError.condition() ? agg.concat(possibleParamError.message) : agg,
        []
      );

      if (paramErrorMessages.length) {
        outerThis.set('createErrorMessage', paramErrorMessages[0]);
        outerThis.get('block').notifyPropertyChange('data');
        setTimeout(() => {
          outerThis.set('createErrorMessage', '');
          outerThis.get('block').notifyPropertyChange('data');
        }, 5000);
        return;
      }

      outerThis.set('createMessage', '');
      outerThis.set('createErrorMessage', '');
      outerThis.set('createIsRunning', true);
      outerThis.get('block').notifyPropertyChange('data');
      outerThis
        .sendIntegrationMessage({
          data: {
            action: 'SUBMIT_ITEMS',
            newIocsToSubmit: outerThis.get('newIocsToSubmit'),
            // TODO: Add Submission option properties here
            foundEntities: outerThis.get('foundEntities'),
            submitTags: outerThis.get('selectedTags')
          }
        })
        .then(({ foundEntities }) => {
          outerThis.set('foundEntities', foundEntities);
          outerThis.set('newIocsToSubmit', []);
          outerThis.set('createMessage', 'Successfully Created IOCs');
        })
        .catch((err) => {
          outerThis.set(
            'createErrorMessage',
            'Failed to Create IOC: ' +
              (err && (err.detail || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('createIsRunning', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('createMessage', '');
            outerThis.set('createErrorMessage', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    },
    editTags: function () {
      this.toggleProperty('editingTags');
      this.get('block').notifyPropertyChange('data');
    },
    deleteTag: function (tagToDelete) {
      this.set(
        'selectedTags',
        this.get('selectedTags').filter(
          (selectedTag) => selectedTag.name !== tagToDelete.name
        )
      );
    },
    searchTags: function (term) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        Ember.run.debounce(this, this.searchTags, term, resolve, reject, 600);
      });
    },
    addTags: function (tags) {
      const selectedTag = this.get('selectedTag');
      const selectedTags = this.get('selectedTags');

      this.set('createMessage', '');

      let newSelectedTags = selectedTag.filter(
        (tag) =>
          !selectedTags.some(
            (selectedTag) =>
              tag.name.toLowerCase().trim() === selectedTag.name.toLowerCase().trim()
          )
      );

      this.set('selectedTags', selectedTags.concat(newSelectedTags));
      this.set('selectedTag', []);
      this.set('editingTags', false);
    }

    // TODO: Add logic based action functions here
  }
});
