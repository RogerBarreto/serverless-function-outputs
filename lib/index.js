'use strict';

const BbPromise = require('bluebird');
const _ = require('lodash');

class ServerlessFunctionOutputs
{
  constructor(serverless, options) 
  {
    this.serverless = serverless;
    this.provider = this.serverless.getProvider('aws');

    this.options = options;
    this.hooks = {
      'after:package:compileFunctions': this.addFunctionOutputs.bind(this)
    };
  }

  addFunctionOutputs() 
  {
    const allFunctions = this.serverless.service.getAllFunctions();
    return BbPromise.each(
      allFunctions,
      functionName => this.addFunctionOutput(functionName)
    );
  }

  addFunctionOutput(functionName) 
  {
    // Add RAW function Arn/Name to Outputs section
    const functionOutputLogicalId = `${this.provider.naming.getLambdaLogicalId(functionName)}`;
    const functionArnOutputLogicalId = `${functionOutputLogicalId}Arn`;
    const functionNameOutputLogicalId = `${functionOutputLogicalId}Name`;

    const functionArnOutput = this.cfOutputFunctionArnTemplate();
    const functionNameOutput = this.cfOutputFunctionNameTemplate();

    functionArnOutput.Value = { 'Fn::GetAtt': [functionOutputLogicalId, 'Arn'] };
    functionNameOutput.Value = { 'Ref': functionOutputLogicalId };

    _.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Outputs, {
      [functionArnOutputLogicalId]: functionArnOutput,
      [functionNameOutputLogicalId]: functionNameOutput
    });
  }

  cfOutputFunctionArnTemplate() 
  {
    return {
      Description: 'Current Lambda Function Arn',
      Value: 'Value'
    };
  }

  cfOutputFunctionNameTemplate() 
  {
    return {
      Description: 'Current Lambda Function Name',
      Value: 'Value'
    };
  }
}

module.exports = ServerlessFunctionOutputs;
