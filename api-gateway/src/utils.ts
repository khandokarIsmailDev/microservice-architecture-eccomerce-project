import axios from "axios";
import { Express, NextFunction, Request, Response } from "express";
import config from "./config.json";
import middlewares from "./middlewares";

export const createHandler = (
  hostname: string,
  path: string,
  method: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {

      let url = `${hostname}${path}`;
      req.params && Object.keys(req.params).forEach(param =>{
        url = url.replace(`:${param}`, req.params[param]);
      });

      const { data } = await axios({
        method,
        url,
        data: req.body,
        headers:{
            origin:'http://localhost:8081',
            'x-user-id':req.headers['x-user-id'] || '',
            'x-user-email':req.headers['x-user-email'] || '',
            'x-user-role':req.headers['x-user-role'] || '',
            'x-user-name':req.headers['x-user-name'] || '',
            'user-agent':req.headers['user-agent'] || ''
        }
      });
      res.status(200).json(data);
    } catch (error) {
      console.error('[error] ',error);
      if (axios.isAxiosError(error)) {
        if (req.originalUrl === '/api/auth/login') {
          if (error.response && error.response.status === 400) {
            res.status(400).json({ message: "User not verified" });
          } else if (error.response && error.response.status === 404) {
            res.status(404).json({ message: "User not found" });
          } 
        }else {
          res.status(502).json({ message: "Bad Gateway found" });
        }
      }
      
      next(error);
    }
  };
};

export const getMiddlewares = (names: string[]) => {  // Specify valid keys from middlewares
    return names.map(name => middlewares[name as keyof typeof middlewares]);
}

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([_name, service]) => {
    const hostname = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        // console.log(method, route.path, hostname);
        const endpoint = `/api${route.path}`;
        const middleware = getMiddlewares(route.middleware)
        const handler = createHandler(hostname, route.path, method);
        
        console.log(`Endpoint:${endpoint}`);
        app[method as keyof Express](endpoint,middleware, handler);
      });
    });
  });
};
