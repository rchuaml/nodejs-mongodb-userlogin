# Description
NodeJS REST API

# Installation
1. download repo-> git clone https://github.com/57chi/nodejs-mongodb-userlogin.git
2. download Node.js-> https://nodejs.org/en/download/
3. direct to folder-> cd nodejs-mongodb-userlogin
4. install dependencies-> npm install
5. run-> npm start (or node app.js)

# Architecture
MVC

# Route
1. Sign up		->	./api/user/register 	(POST)
2. Sign in		->	./api/user/login 		(GET)
3. Modify profile		->	./api/user/profile 		(GET & PUT)
4. Change password	->	./api/user/security	(PUT)
5. Check JWT				->	./api/user/auth		 	(GET)

# Packages
1. express-> NodeJS web framework
2. dotenv-> read the .env file and set to process.env
3. body-parser-> parse to json format and access by req.body
4. mongoose-> MongoDB object modeling tool
5. bcrypt-> hash and compare password
6. jsonwebtoken-> generate token and carry user id
7. cors-> middleware that allow express to perform Cross-origin resource sharing (CORS)
8. multer-> middleware for handling multipart/form-data
9. nodemon-> restart app automatically

# AWS Elastic Beanstalk Deployment
refer to https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/GettingStarted.html?icmpid=docs_elasticbeanstalk_console

# Result
http://testnodeapp-env.itmejkqfz2.us-east-1.elasticbeanstalk.com/api/user/test
