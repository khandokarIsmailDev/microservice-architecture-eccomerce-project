# Practical Microservice Project - Learn with Stack Learner

1. create docker compose file
2. docker compose up

## first we work with inventory service (servecs/inventory)

1. first npm install in the root folder (`npm i express cors dotenv morgan jod`)
2. index.ts is our Root file
3. create `controllers` folder and create `index.ts` file
4. for typescript we need install jod for type checking
5. and create schema for inventory
6. `npm i -D typescript tsc ts-node-dev tsc-alias tsconfig-paths` for run typescript
7. `npx tsc --init` for create tsconfig.json file 
8. now we see the error ,coz we setup tsconfig.json file
9. `npm i -D @types/express @types/node @types/cors @types/morgan` for type checking
10. then add `"scripts": { "dev": "ts-node-dev -r tsconfig-paths/register ./src/index.ts", "build": "tsc && tsc-alias" }` in package.json file
11. now we can run `npm run dev` for run the server
