/* eslint-disable consistent-return */
const _ = require('lodash');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const constants = require('generator-jhipster/generators/generator-constants');
const statistics = require('generator-jhipster/generators/statistics');

const SERVER_MAIN_SRC_DIR = `${constants.MAIN_DIR}dotnet/`;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, Object.assign({ fromBlueprint: true }, opts));
        this.argument('name', { type: String, required: true });
        this.name = this.options.name;

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        this.option('default', {
            type: Boolean,
            default: false,
            description: 'default option'
        });
        this.defaultOption = this.options.default;
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            initializing() {
                this.log(`The service ${this.name} is being created.`);
                const configuration = this.getAllJhipsterConfig(this, true);
                const blueprintConfiguration = this.getJhipsterAppConfig('generator-jhipster-dotnet');
                this.baseName = blueprintConfiguration.baseName || configuration.get('baseName');
                this.packageName = blueprintConfiguration.packageName || configuration.get('packageName');
                this.packageFolder = blueprintConfiguration.packageFolder || configuration.get('packageFolder');
                this.databaseType = blueprintConfiguration.databaseType || configuration.get('databaseType');
            }
        };
    }

    get initializing() {
        return this._initializing();
    }

    _prompting() {
        return {
            prompting() {
                const prompts = [
                    {
                        type: 'confirm',
                        name: 'useInterface',
                        message: '(1/1) Do you want to use an interface for your service?',
                        default: false
                    }
                ];
                if (!this.defaultOption) {
                    const done = this.async();
                    this.prompt(prompts).then(props => {
                        this.useInterface = props.useInterface;
                        done();
                    });
                } else {
                    this.useInterface = true;
                }
            }
        };
    }

    get prompting() {
        return this._prompting();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'service-dotnet', { interface: this.useInterface });
            }
        };
    }

    get default() {
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {
            write() {
                this.serviceClass = _.upperFirst(this.name) + (this.name.endsWith('Service') ? '' : 'Service');
                this.serviceInstance = _.lowerCase(this.serviceClass);

                this.template(
                    `${SERVER_MAIN_SRC_DIR}Services/Service.cs.ejs`,
                    `${SERVER_MAIN_SRC_DIR + this.packageFolder}/Services/${this.serviceClass}.cs`
                );

                if (this.useInterface) {
                    this.template(
                        `${SERVER_MAIN_SRC_DIR}Services/Impl/ServiceImpl.cs.ejs`,
                        `${SERVER_MAIN_SRC_DIR + this.packageFolder}/Services/Impl/${this.serviceClass}Impl.cs`
                    );
                }
            }
        };
    }

    get writing() {
        return this._writing();
    }

};
