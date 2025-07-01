import { defineEventHandler, readBody, setCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { password } = await readBody(event)

  if (password === config.adminPassword) {
    setCookie(event, 'mahjong-rank-auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })

    return {  }
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: '密码错误',
    })
  }
})

