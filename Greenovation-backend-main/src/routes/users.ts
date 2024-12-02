import { Router } from 'express'
import { User } from '../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import { EdificiDUsuari } from '../models/EdificiDUsuari'
import { Event } from '../models/Event'
import { MissionInProgress } from '../models/MissionInProgress'
import { Mission } from '../models/Mission'
import { MissionEvent } from '../models/MissionEvent'
import { CompletedEvent } from '../models/CompletedEvent'
import { CompletedMission } from '../models/CompletedMission'
import { LletraEnergetica } from '../models/LletraEnergetica'
import * as FirebaseService from '../FirebaseService'

dotenv.config()
export const users = Router()

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID)

users.post('/auth/google', async (req, res, next) => {
  try {
    const { token } = req.body
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload()

    if (payload === null || payload === undefined) {
      return res.status(400).json({ message: 'Invalid Google token' })
    }

    const { sub: googleId, email, name } = payload

    let user = await User.findOne({ where: { googleId } })

    if (user === null || user === undefined) {
      user = await User.create({
        googleId,
        username: email,
        password: '', // Set an empty password for Google-authenticated users
        name,
        mail: email
      })
    }

    const accessToken = generateAccessToken({ user: user.id })
    const refreshToken = generateRefreshToken({ user: user.id })

    res.json({ id: user.id, accessToken, refreshToken })
  } catch (exc) {
    next(exc)
  }
})

export async function getUser (id: number): Promise<User | null> {
  const user = await User.findByPk(id)
  return user
}

export async function afegirDiners (id: number, quantitat: number): Promise<void> {
  const user = await User.findByPk(id)
  await user?.increment('diners', { by: quantitat })
}

export async function pagar (id: number, quantitat: number): Promise<void> {
  const user = await User.findByPk(id)
  await user?.decrement('diners', { by: quantitat })
}

// accessTokens
function generateAccessToken (user: object): string {
  // @ts-ignore
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {}) // { expiresIn: '15m' }
}
// refreshTokens
let refreshTokens: any[] = []
function generateRefreshToken (user: object): string {
  // @ts-ignore
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {}) // { expiresIn: '20m' }
  refreshTokens.push(refreshToken)
  return refreshToken
}

export function validateToken (req: any, res: any, next: any): void {
  const authHeader = req.headers.authorization
  let token = null
  if (authHeader != null) token = authHeader.split(' ')[1]
  if (token == null) res.status(400).json({ message: 'Token not present' })
  else {
    // @ts-ignore
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (err) {
        res.status(403).json({ message: 'Invalid token' })
      } else {
        req.user = user
        next()
      }
    })
  }
}

export async function pujaDeLletra (ID: number, max: number): Promise<boolean> {
  const edifici = await EdificiDUsuari.findByPk(ID)
  if (edifici != null && edifici.energia < max) {
    const l = edifici.classificacio.charCodeAt(0)
    const body = {
      classificacio: String.fromCharCode(l - 1)
    }
    await EdificiDUsuari.update(body, { where: { id: ID } })
    await addAvailableMissions(edifici.userId)
    return true
  }
  return false
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.post('/', async (req, res, next) => {
  try {
    delete req.body.id
    delete req.body.diners
    req.body.password = await bcrypt.hash(req.body.password, 10)
    const user = await User.create(req.body)
    res.status(201).json(user)
  } catch (exc) {
    next(res.status(400).json({ message: 'Invalid parameters in the query' }))
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('', async (req, res, next) => {
  try {
    res.json(await User.findAll({ attributes: { exclude: ['password'] } }))
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.post('/login', async (req, res, next) => {
  if (req.body.username == null || req.body.password == null) {
    res.status(400).json({ message: 'Request missing username or password' })
  } else {
    const user = await User.findOne({ where: { username: req.body.username } })
    if (user == null) {
      res.status(404).json({ message: 'No user with this username found' })
    } else if (user.googleId !== null && user.googleId !== undefined) {
      res.status(400).json({ message: 'Please log in using Google' })
    } else if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken({ user: user.id })
      const refreshToken = generateRefreshToken({ user: user.id })
      if (req.body.token != null) {
        await FirebaseService.saveToken(String(user.id), String(req.body.token))
      }
      res.json({ id: user.id, accessToken, refreshToken })
    } else {
      res.status(401).json({ message: 'Incorrect password' })
    }
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.post('/refreshToken', async (req, res, next) => {
  if (!refreshTokens.includes(req.body.token)) res.status(400).json({ message: 'Invalid token' })
  else {
    refreshTokens = refreshTokens.filter((c) => c != req.body.token)

    const accessToken = generateAccessToken({ user: req.body.userId })
    const refreshToken = generateRefreshToken({ user: req.body.userId })

    res.json({ accessToken, refreshToken })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.delete('/logout', async (req, res, next) => {
  refreshTokens = refreshTokens.filter((c) => c != req.query.token)
  res.status(204).json({ message: 'Logged out' })
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/username/:username', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username }, attributes: { exclude: ['password'] } })
    if (user == null) res.status(404).json({ message: 'No user with this username found' })
    else res.status(200).json(user)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/mail/:mail', async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { mail: req.params.mail }, attributes: { exclude: ['password'] } })
    if (user == null) res.status(404).json({ message: 'No user with this mail found' })
    else res.status(200).json(user)
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } })
    if (user == null) {
      res.status(404).json({ message: 'No user found with this id' })
    } else {
      res.json(user)
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.put('/:id', validateToken, async (req, res, next) => {
  try {
    // @ts-ignore
    if (req.user.user != req.params.id) {
      res.status(401).json({ message: 'Unauthorized to edit this user' })
    } else {
      delete req.body.id
      delete req.body.diners
      if (req.body.password != null) req.body.password = await bcrypt.hash(req.body.password, 10)
      await User.update(req.body, { where: { id: req.params.id } })
      const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } })
      if (user == null) res.status(404).json({ message: 'No user found with this id' })
      else res.status(200).json(user)
    }
  } catch (exc) {
    res.status(400).json({ message: 'Invalid attribute for fields' })
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.delete('/:id', validateToken, async (req, res, next) => {
  try {
    // @ts-ignore
    if (req.user.user != req.params.id) {
      res.status(401).json({ message: 'Unauthorized to delete this user' })
    } else {
      const user = await User.findByPk(req.params.id)
      if (user == null) res.status(404).json({ message: 'No user found with this id' })
      else {
        await User.destroy({ where: { id: req.params.id } })
        res.sendStatus(204)
      }
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/:id/completableMissions', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (user == null) res.status(404).json({ message: 'No user with this id' })
    else {
      const completableMissions: Mission[] = []
      const missionsInProgress = await MissionInProgress.findAll({ where: { userId: user.id } })
      for (const mIP of missionsInProgress) {
        const mission = await Mission.findByPk(mIP.missionId)
        if (mission != null && mIP.numCompletedEvents >= mission.eventsForCompletion) completableMissions.push(mission)
      }
      res.status(200).json(completableMissions)
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/:id/missionsInProgress', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (user == null) res.status(404).json({ message: 'No user with this id' })
    else {
      const missionsInProgress = await MissionInProgress.findAll({ where: { userId: user.id } })
      const missions: Mission[] = []
      for (const mIP of missionsInProgress) {
        const m = await Mission.findByPk(mIP.missionId)
        if (m != null) missions.push(m)
      }
      missions.sort((m1, m2) => m1.id - m2.id)
      res.status(200).json(missions)
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.get('/:id/availableEvents', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id)
    if (user == null) res.status(404).json({ message: 'No user with this id' })
    else {
      const edifici = await EdificiDUsuari.findOne({ where: { userId: user.id } })
      if (edifici == null) res.status(404).json({ message: 'The user doesn\'t have a building' })
      else {
        const availableEvents: Event[] = []
        const availableEventsIds: number[] = []
        const missionsInProgress = await MissionInProgress.findAll({ where: { userId: user.id } })
        for (const mIP of missionsInProgress) {
          const missionEvents = await MissionEvent.findAll({ where: { missionId: mIP.missionId } })
          for (const mE of missionEvents) {
            const completedEvent = await CompletedEvent.findOne({ where: { missionEventId: mE.id, missionInProgressId: mIP.id } })
            if (completedEvent == null) {
              const event = await Event.findOne({ where: { id: mE.eventId } })
              if (event != null && !availableEventsIds.includes(event.id)) {
                availableEvents.push(event)
                availableEventsIds.push(event.id)
              }
            }
          }
        }
        availableEvents.sort((e1, e2) => e1.id - e2.id)
        res.status(200).json(availableEvents)
      }
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.post('/:id/completedEvent', validateToken, async (req, res, next) => {
  try {
    // @ts-ignore
    if (req.user.user != req.params.id) {
      res.status(401).json({ message: 'Unauthorized to edit this user' })
    } else {
      const user = await User.findOne({ where: { id: req.params.id } })
      if (user == null) res.status(404).json({ message: 'No user found with this id' })
      else {
        const edifici = await EdificiDUsuari.findOne({ where: { userId: req.params.id } })
        if (edifici == null) res.status(404).json({ message: 'The user does not have a building' })
        else {
          const event = await Event.findOne({ where: { id: req.query.eventId } })
          if (event == null) res.status(404).json({ message: 'No event found with the indicated id' })
          else {
            // obtain all missionEvents with eventId
            const missionEvents = await MissionEvent.findAll({ where: { eventId: event.id } })
            let applied = false
            for (const mE of missionEvents) {
              // obtain all missionsInProgress with missionId = missionEvent.missionId and userId
              const missionsInProgress = await MissionInProgress.findAll({ where: { userId: user.id, missionId: mE.missionId } })
              for (const mIP of missionsInProgress) {
                // check if the missionEvent for the missionInProgress has already been completed
                const completedEvent = await CompletedEvent.findOne({ where: { missionEventId: mE.id, missionInProgressId: mIP.id } })
                if (completedEvent == null) {
                  applied = true
                  await CompletedEvent.create({ missionEventId: mE.id, missionInProgressId: mIP.id })
                  await mIP.increment('numCompletedEvents', { by: 1 })
                }
              }
            }
            if (applied) {
              await edifici.increment('energia', { by: event.energy })
              await edifici.increment('emissions', { by: event.CO2 })
              if (edifici.felicitatVeins + event.happiness <= 100) await edifici.increment('felicitatVeins', { by: event.happiness })
              else edifici.felicitatVeins = 100
              await user.decrement('diners', { by: event.money })
              res.status(201).json({ message: 'Event successfully completed' })
            } else res.status(400).json({ message: 'The user does not have any mission in progress for which to complete the event' })
          }
        }
      }
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.post('/:id/completedMission', validateToken, async (req, res, next) => {
  try {
    // @ts-ignore
    if (req.user.user != req.params.id) {
      res.status(401).json({ message: 'Unauthorized to edit this user' })
    } else {
      const user = await User.findByPk(req.params.id)
      if (user == null) res.status(404).json({ message: 'No user found with this id' })
      else {
        const edifici = await EdificiDUsuari.findOne({ where: { userId: req.params.id } })
        if (edifici == null) res.status(404).json({ message: 'The user does not have a building' })
        else {
          const mission = await Mission.findOne({ where: { id: req.query.missionId } })
          if (mission == null) res.status(404).json({ message: 'No mission found with the indicated id' })
          else {
            const missionInProgress = await MissionInProgress.findOne({ where: { userId: user.id, missionId: mission.id } })
            if (missionInProgress == null) res.status(400).json({ message: 'The user has no mission in progress with the indicated id' })
            else {
              if (missionInProgress.numCompletedEvents < mission.eventsForCompletion) res.status(400).json({ message: 'The user has not completed enough events to complete the indicated mission' })
              else {
                await CompletedMission.create({ userId: user.id, missionId: mission.id })
                await CompletedEvent.destroy({ where: { missionInProgressId: missionInProgress.id } })
                await MissionInProgress.destroy({ where: { id: missionInProgress.id } })
                await edifici.decrement('energia', { by: mission.energy })
                await edifici.decrement('emissions', { by: mission.CO2 })
                if (edifici.felicitatVeins + mission.happiness <= 100) await edifici.increment('felicitatVeins', { by: mission.happiness })
                else edifici.felicitatVeins = 100
                await user.increment('diners', { by: mission.money })
                const lletra = await LletraEnergetica.findOne({ where: { lletra: edifici.classificacio } })
                let bool = false
                if (lletra != null) bool = await pujaDeLletra(edifici.id, lletra.maxEmissions)
                let message = 'Mission successfully completed'
                if (bool) message = 'Ha pujat de lletra'
                res.status(201).json({ message })
              }
            }
          }
        }
      }
    }
  } catch (exc) {
    next(exc)
  }
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
users.delete('/:id/completedMissions', validateToken, async (req, res, next) => {
  try {
    // @ts-ignore
    if (req.user.user != req.params.id) {
      res.status(401).json({ message: 'Unauthorized to edit this user' })
    } else {
      const user = await User.findByPk(req.params.id)
      if (user == null) res.status(404).json({ message: 'No user found with this id' })
      else {
        await CompletedMission.destroy({ where: { userId: user.id } })
        await addAvailableMissions(user.id)
        res.status(204).json({ message: 'Completed missions of the user successfully reset' })
      }
    }
  } catch (exc) {
    next(exc)
  }
})

export async function addAvailableMissions (id: number): Promise<void> {
  const user = await User.findByPk(id)
  if (user != null) {
    const edifici = await EdificiDUsuari.findOne({ where: { userId: user.id } })
    if (edifici != null) {
      let missions: Mission[] = []
      for (let i = edifici.classificacio.charCodeAt(0) - 64; i <= 7; i++) {
        missions = missions.concat(await Mission.findAll({ where: { lletraId: i } }))
      }
      for (const m of missions) {
        const completedMission = await CompletedMission.findOne({ where: { userId: user.id, missionId: m.id } })
        const missionInProgress = await MissionInProgress.findOne({ where: { userId: user.id, missionId: m.id } })
        if (completedMission == null && missionInProgress == null) {
          await MissionInProgress.create({ userId: user.id, missionId: m.id })
        }
      }
    }
  }
}
