import { PrismaClient } from '@prisma/client'
import { config } from './index'

declare global {
  var prisma: PrismaClient | undefined
}

// Prevent multiple instances during development hot-reload
export const prisma = global.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (config.nodeEnv !== 'production') {
  global.prisma = prisma
}