import express, { type Request, type Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { users } from './routes/users'
import dotenv from 'dotenv'
import { dadesObertes } from './routes/dadesObertes'
import { edificisdusuari } from './routes/edificisdusuari'
import { millora } from './routes/millora'
import { categoria } from './routes/categoria'
import { lletra } from './routes/lletraEnergetica'
import { aplicades } from './routes/teAplicades'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import path from 'path'
import { events } from './routes/events'
import { recompensa } from './routes/recompensaRanking'
import { missions } from './routes/missions'

// Loads the environment variables from the .env file
dotenv.config()
const app = express()

// const corsOptions = {
//   origin: process.env.CORS_ORIGIN
// }

app.use(cors())
app.use(express.json())

// middleware for json body parsing
app.use(bodyParser.json())
// app.use(bodyParser.json({limit: '5mb'}));

/*
// enable corse for all origins
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Expose-Headers", "x-total-count");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type,authorization");

    next();
});
*/

const swaggerDocsPath = path.join(__dirname, '../docs/openapiGreenovation.yaml')
const swaggerDocument = YAML.load(swaggerDocsPath)

app.use('/users', users)
app.use('/dadesObertes', dadesObertes)
app.use('/edificis', edificisdusuari)
app.use('/millores', millora)
app.use('/categoria', categoria)
app.use('/lletra', lletra)
app.use('/events', events)
app.use('/categories', categoria)
app.use('/lletres', lletra)
app.use('/milloresAplicades', aplicades)
app.use('/missions', missions)
app.use('/recompenses', recompensa)
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' })
})

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app
