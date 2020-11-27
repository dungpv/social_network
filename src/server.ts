import dotenv from 'dotenv';

import App from "./app";
import { IndexRoute } from "@modules/index";
import { validateEnv } from '@core/utils';
import UserRoute from '@modules/users/user.route';

dotenv.config({ path: `${__dirname}/.env` })

validateEnv();

const routes = [
    new IndexRoute(),
    new UserRoute(),
];

const app = new App(routes);

app.listen();
