import axios from "axios";
import { Express, NextFunction, Request, Response } from "express";
import config from "./config.json";

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
      });
      res.status(200).json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        res.status(502).json({ message: "Bad Gateway" });
      }
      console.error(error);
      next(error);
    }
  };
};

export const configureRoutes = (app: Express) => {
  Object.entries(config.services).forEach(([_name, service]) => {
    const hostname = service.url;
    service.routes.forEach((route) => {
      route.methods.forEach((method) => {
        // console.log(method, route.path, hostname);
        const handler = createHandler(hostname, route.path, method);
        const endpoint = `/api${route.path}`;
        console.log(`Endpoint:${endpoint}`);
        app[method as keyof Express](endpoint, handler);
      });
    });
  });
};
