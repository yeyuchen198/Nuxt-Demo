/**
 * GET /api/decode?data=<base64 字符串>
 *
 * 成功响应 200：
 *   { "decoded": "<解码后的文本>" }
 *
 * 错误响应 400：
 *   { "error": "<错误描述>" }
 */
export default defineEventHandler(async (event) => {
  const query = getQuery<{ data?: string }>(event)

  // ---- 参数校验 ----
  if (!query?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少查询参数 "data"，用法：/api/decode?data=<base64字符串>'
    })
  }

  // getQuery 返回的可能是 string | string[]，统一取第一个
  const raw = Array.isArray(query.data) ? query.data[0] : query.data
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '"data" 参数不能为空'
    })
  }

  // ---- 修复 URL 对 Base64 的破坏 ----
  // 框架底层做 decodeURIComponent 后，标准 Base64 中的 "+" 会变成空格
  // 同时也要兼容 URL-Safe Base64（用 "-" "_" 替代 "+" "/"）
  let fixed = trimmed
    .replace(/ /g, '+')       // 空格还原为 "+"
    .replace(/-/g, '+')       // URL-Safe: "-" → "+"
    .replace(/_/g, '/')       // URL-Safe: "_" → "/"

  // 补齐 padding（URL-Safe Base64 经常省略尾部的 "="）
  const pad = fixed.length % 4
  if (pad) {
    fixed += '='.repeat(4 - pad)
  }

  // ---- Base64 解码 ----
  let decoded: string

  try {
    const buffer = Buffer.from(fixed, 'base64')
    decoded = buffer.toString('utf-8')
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: `Base64 解码失败：${(err as Error).message}`
    })
  }

  // ---- 服务端打印 ----
  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false })
  console.log(
    `\n[${timestamp}] 收到 Base64 解码请求：\n` +
    `  原始 (前80字符): ${trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed}\n` +
    `  解码结果: ${decoded}\n`
  )

  return { decoded }
})
