# Practical Microservice Project - Learn with Stack Learner

1. create docker compose file
2. docker compose up

# If `npm run build` command not work for `inventory` & `product` service, then follow the `user` service `tsconfig.json` file and `package.json` file

## first we work with inventory service (servecs/inventory)

1. first npm install in the root folder (`npm i express cors dotenv morgan zod`)
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


## now we work with postgres

1. we already run the postgres service in docker compose file
2. now visit `localhost:5050` in browser
3. now we can see the postgres is running
4. now login with `ismailkhandokar0@gmail.com` email and `admin` password
5. now create a new server `postgres-server`
6. a big provlem `localhost or using 127.0.0.1` will not work in `Connection` tab
7. now we need to inspect the `postgres` container and get the ip address `docker inspect postgres`
8. now we can see the ip address in the `Networks` section
9. now we can use the ip address in the `Connection` tab in `Host name/address` field
![image](./Readmi-image/scr1.png)
10. but ip address is not a good idea for production, because ip address can change
11. so we need to use the `postgres` name in the `Host name/address` field, and username and password is `postgres`
![image](./Readmi-image/src2.png)

NOTE : `host.docker.internal` is a special Host name/address; if mac is not working `postgres`,then use `host.docker.internal`

## now we work with prisma

1. `npm i prisma @prisma/client --save-dev` for install prisma client
2. `npx prisma init --datasource-provider postgresql` for create prisma folder and prisma schema file

## Endponits 
![image](./Readmi-image/src3.png)

## Modify ERD Diagram
![image](./Readmi-image/src4.png)
- modify the ERD Diagram, now we have separeted the connected tables, this diagram is clearfy the relationship between the tables for specific service; and we will confirm how many services we need to create

## History and Inventory Service
![image](./Readmi-image/src5.png)

## Create Inventory Service

`{{bash}}/inventories`

```js
{
    "productId":"test_idd",
    "sku":"test_skud"
}
```
- create inventory
- update inventory
- get inventory by id
- get inventory details by id

# now we work with Product Service
![image](./Readmi-image/src6.png)

# now Complete Product Service
- create Product Service
- Get All Products
- Get Product By Id

## Inventory and Product Service er jonno amra 2ta service create korsi; akhon client k eto kiso jananor dorkar nai, client k akta matro url dibo jekhane hit korle 2ta service er response asbe; er jonno  `Api Gateway` service create korte hobe;

# Api Gateway Service

![image](./Readmi-image/src7.png)
![image](./Readmi-image/src8.png)

### Most important file is `config.json` && `utils.ts` file; ai 2 ta file er kaj holo `Api Gateway` service er kaj;

- `http://localhost:8081/api/inventories/cm3r4p8mp00007sdm1j8d2i22/details` -> `inventory by id     `
- `http://localhost:8081/api/products/cm3r4p8mp00007sdm1j8d2i22` -> `single product`
- `http://localhost:8081/api/products` -> `all products`

# Rate Limiting
Rate limiting check korar jonno `express-rate-limit` package use kora hoyeche; `index.ts` file e rate limiting 5 korbe; 15 minutes er moddhe 5 ta request accept korbe; er besi korle 429 error dibe; DDOS attack theke protect korar jonno use kora hoyeche; 
Postmane Show this response , if we hit more than 5 times in 15 minutes;
```js
{
    "message":"Too many requests from this IP, please try again in 15 minutes"
}
```

# Access Denied
amra jehoto `Api Gateway` service create korsi, jekhane `inventory` &&  `product` service er response asbe; er jonno `Api Gateway` service er `config.json` file e `inventory` && `product` service er `origin` set kora hoyeche;
akhon amra chai na baire theke `inventory` && `product` service er endpoint hit korte parok; er jonno akta middleware create korbo `index.ts` file e; both service er khetre;(`inventory`&&`product`)


# Day 3 - Implementing Authentication Service
![image](./Readmi-image/src9.png)
![image](./Readmi-image/src10.png)

`src10` image e chart e follow kora hoyse; we create the service serrilay;
- 1st `user Service`
- 2nd `Email Service`,
- 3rd `Auth Service`

## `auth` Service create ; now we create the `user` service;

![image](./Readmi-image/src11.png)

# `user` & `auth` service er connection
- `user` service moloto user er profile create korbe;
- `auth` service moloto user er authentication korbe;
- `auth` service er `userRegistration` controller theke `user` service er create-user controller e call kore user profile create korbe;

## NOTE: `auth` service er `userRegistration` controller theke `email` service er `sentEmail` controller e call kora hoyeche; tai `email` service create korte hobe; then `auth` service run korte hobe;

1. `userRegistration.ts` - er jonno `schemas.ts` e create kora hoyeche 
2. `userLogin.ts` create kora hoyeche
3. `verifyToken.ts` create kora hoyeche
4. `verifyEmail.ts` create kora hoyeche  //1st create `email` service then do this
 
 ## `email` service
 - `email` service er jonno `mailhog` service use kora hoyeche; docker-compose.yaml file e `mailhog` service add kora hoyeche; smtp port e `1025` & http port e `8025` set kora hoyeche; amra chaile porobortite real smtp server use korte parbo ai docker compose file e;
 - `http://localhost:8025` e jabe mailhog er dashboard;

## `email` service er jonno serially ai kaj gola korte hobe


# Day 4 - Card Service with Redis

![image](./Readmi-image/src12.png)

- Redis : Remote Dictionary Server 
![image](./Readmi-image/src13.png)

- Redis Data Types
![image](./Readmi-image/src14.png)

- **string** : string diye doniar sob kaj e kora jay; like json k string e convert kore feli, tahol ek string diye sob kaj korte pari; mostly sob jaygay caching er jonno use kora hoy;
- **list** : list is kind of array but kono array na,list take stack othoba queue both purpose use korte pari;redis er modde kono array data structure nai;  
- **sorted set** : priority queue hisabae use kora jay; `queue vs sorted set`: 
- **hash** : javascript er object er moto kaj kore; 
- **json** : very very powerful than hash; norlma kaje hase use kori, but continuasly update er jonno use kora hoy; sodo write operation er jonno use kora hoy; `hash` er osobida hosse nested object rakte pare nah; `json` multi label nesting korte pare, er bitor array rakte pare; binno binno data rakhte pare;
- **stream** : stream er jonno use kora hoy; kind of bytes er data rakhte pare;
- **geospatial** : map/location er jonno use kora hoy; 
- **time series** : time series data er jonno use kora hoy; poti second 1lak er besi data rakhte pare;

### Run Redis Server with Docker
```bash
docker run -it --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```
- `-p 6379:6379` : 6379 is the port for redis server
- `-p 8001:8001` : 8001 is the port for redis stack server ( redis insider dashboard er jonno)

- product jokhon cart e add kora hoy, tai cart e add korar somoy product er quantity update korte hobe; and sei sate akta TTL(for redis) mane time to live set korte hobe; jemon 2 minute set kore dilam, tai 2 minute porjonto cart e product er quantity update korte pare; 2 minute por user checkout na korle inventory theke product ta realize hoy jabe;
- localstroage er kono proyozon nai ai khetre;
![image](./Readmi-image/src15.png)

### Relise product after 2min
- er jonno amra `events` => `onKeyExpires.ts` file er modde `redis` er `subscribe` method use kora hoyeche; aita abar just `index.ts` ter link kore dewa hoise; er kaj 2 min por redis product relese kore dibe and setar log info show korbe terminal e; and age to amra ekta kaj korei rekhe silam; 2 mint er modde product add-to-cart theke delete hoye jabe, ar ekhon tar log info show korbe terminal e; aitoko kora hoise

