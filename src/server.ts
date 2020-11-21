import dotenv from 'dotenv';

import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from '@core/utils';

dotenv.config({ path: `${__dirname}/.env` })

validateEnv();

const routes = [new IndexRoute()];

const app = new App(routes);

app.listen();
