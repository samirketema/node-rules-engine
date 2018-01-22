# node-rules-engine
Rules Engine implemented in Node.js

This is a REST service which allows clients to apply rules against input. 

Given a set of rules, one may utilize this service to apply these rules against JSON to verify data integrity. 

## Rules Engine Structure
A `Rule` is built out of :
  1. `Operator` which defines the functions applied upon several operands.
  2. Operand, an array of `Operand`s which the `Operator` is applied upon.
An `Operand` consists of the following:
 1. A constant value, specified by `value` (as in `"value": "[0-9]{5}"`). The type is always string. During validation, this value is automatically converted into the correct type.
  2. Reference to a field of the input, specified by `field` (as in `"field": "username"`). To refer to a field within a field, the dot notation is used (as in `"field": "address.zip_code"`).
  3. Another rule with `operator` and `operands`.
  
Example `Rule` structure containing `Operators` and `Operands`:
```js
{
  "username_length": {
    "name": "username_length",
    "rule": {
      "operator": "GREATER_THAN",
      "operands": [
        {
          "operator": "LENGTH",
          "operands": [
            {
              "field": "username"
            }
          ]
        },
        {
          "value": "4"
        }
      ]
    }
  }
```
**Note how the name is used as a JSON key. This is so one can search for a specific rule to update, view, or apply.**

Example `Operand` structure:


## Service Overview

POST /api/validation

Valid request: 
```js
`POST /api/validation`
{
  "username": "bwillis",
  "password": "",
  "first_name": "Bruce",
  "last_name": "Willis",
  "date_of_birth": "03/19/1955",
  "email": "bruce@willis.com",
  "phone": "424-288-2000",
  "address": {
    "street": "2000 Avenue Of The Stars",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90067"
  }
}
```
Corresponding response:
```js
200
{
  "result": "success"
}
```

Invalid request:
```
{
  "username": "bw",
  "password": "2",
  "first_name": "Bruce",
  "last_name": "Willis",
  "date_of_birth": "03/19/1955",
  "email": "bruce@willis.com",
  "phone": "-424-288-2000",
  "address": {
    "street": "2000 Avenue Of The Stars",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "390067"
  }
}
```
Corresponding response:
```js
400
{
  "result": "failure",
  "rules": [
    "username_length",
    "password_length",
    "phone_pattern",
    "zip_code_pattern"
  ]
}
```


Other notable API Endpoints:
```
GET /api/rules
GET /api/rules/:name
GET /api/operators
```

### Install & Run

#### Install
To run node-rules-engine, you need the following installed on your system:
```
node v8.9.3
mocha-cli@1.0.1
```

To install various versions of Node.js, [nvm](https://github.com/creationix/nvm) is extremely helpful. To install mocha-cli, simply issue
```
npm install mocha-cli@1.0.1 -g
```

Once you've installed node and mocha-cli and cloned this repo, issue the following command at the root project directory to pull all dependencies.
```
npm install
```
#### Run
Run in production mode:
```
npm start
```
Run in development mode:
```
npm run-script dev
```

## Tests
To run tests:
```
npm test
```
Tests are written using [mocha](https://github.com/mochajs/mocha), [chai](https://github.com/chaijs/chai), and [supertest](https://github.com/visionmedia/supertest). 
Currently there are the following tests on the `/api/validation` API Endpoint.

* Validation pass
* Validation failure on one rule
* Validation failure of all rules
* Validation pass (due to no rules present)
* Empty Obj on request body
* No request body
* Missing fields (Rules cannot be applied to input)

## Deployment

Once node is installed on the system, install [forever](https://github.com/foreverjs/forever) globally:
```
npm install forever -g
```
Run the server as such:
```
forever npm start
```

#### Deployment To-Dos:
* Create Build Process (Grunt, Gulp, Webpack)
* Continuous Integration (Jenkins, Travis, AWS CodeBuild/CodePipeline, etc)
* Automate Deployment (AWS CodeDeploy, etc)
* Automate Infrastucture Provisioning (CloudFormation, Terraform, etc)

## Scaling Considerations
1. Adding slow rules (e.g., those that make external calls or interact with DB)

  * Node.js is a great environment for handling requests to databases and external APIs when using async calls with the event loop model. That being said, if we have many calls to external services, we can investigate usage of a circuit breaker such as [hystrix](https://www.npmjs.com/package/hystrixjs) to stop cascading failure.
  * On that note, adding promises to this service would make the code more maintainable as these external calls scale.
  * If a rule is complex, enlisting the help of a database may be helpful. This service could take validation requests and compare against normalized rules or utilize constraints from a relational database. If the rule structure is rapidly changing and does not require any normalization, then a database like MongoDB would be storing rules (not for validating data integrity for things like transactions though).

2. Scaling the number of rules
  * On the other hand, given that Node.js is single-threaded, parallelism is not straightforward (although concurrency is). This service could be implemented to spawn child processes for various rules. However, applying thousands of rules to one JSON object would bode better in an environment like Golang or even Java for goroutines and multithreading respectively. The service could break down the JSON object and apply various rules in parallel to the different portions of the input JSON.
  * If the service receives a lot of rule updates, functionality for reducing overlapping rules would improve validation best-case runtime. For example, if there exists a rule on password length being greater than 2 and a client adds another rule for passwords being greater than 4, the rule is reduced to the original rule. Reducing overlapping rules removes redundancy in validation processing. This can becomve a caveat if clients wish to delete rules.
  * To continue the last note, it would be beneficial to reject rules which are impossible. For example, if a rule on password length being greater than 4 exists, a client must not be able to add a rule on password length being less than 2. If these rules were within a bigger rule, however, this would be possible (as in the OR operator).

3. Scaling the traffic (requests/queries per second to API)
  * Vertical Scaling : If we want to vertically scale, we can utilize the [cluster](https://nodejs.org/api/cluster.html) module to create several processes running the server along with NGINX on a single machine. Add resources to this machine as necessary (downside: takes time and cannot handle quick influx of large demand).
  * Horizontal Scaling: If we anticipate fast scaling, we can do horizontal scaling from the get-go. Tools/Paradigms that would make scaling easier: AWS ELB (Elastic Load Balancer) to direct requests in round-robin, AWS EC2 Auto-Scaling Groups to scale in and scale out, usage of multiple Availbility Zones & Regions in AWS to add fault tolerance to infrastructure, and Terraform/CloudFormation to automate provisioning of these resources)
  * With either of these approaches, if we know there is a guaranteed amount of load on the API for a period of time, we can opt-in for reserved instances on AWS to save some money.

## Assumptions
* REGEX_MATCH will only be applied to one operand (e.g. apply regex on one field)
* EQUAL_TO refers to **strict** equality (in Javascript: ===. As a result, does not evaluate equality of contents of two objects, but rather their references)
