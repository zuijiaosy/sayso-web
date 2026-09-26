// Scripted utterances for the web demos. Each one carries what was said (with
// the fillers a real transcript has) and what each cleanup mode and each
// translation target produces. `off` is the raw transcript after dictionary
// replacements, which the app applies even with cleanup off.
export type Cleanup = 'off' | 'fix' | 'polish'
export type Target = 'en-US' | 'ja-JP' | 'ko-KR'

export type Sample = {
  said: string
  off: string
  fix: string
  polish: string
  tr: Record<Target, string>
  /** Dictionary hit shown as a hint, e.g. "deep seek → DeepSeek". */
  dict?: [string, string]
}

export const samples: Sample[] = [
  {
    said: '嗯那个我们明天下午三点开个会吧就是讨论一下官网首页的那个设计',
    off: '嗯那个我们明天下午三点开个会吧就是讨论一下官网首页的那个设计',
    fix: '嗯，那个我们明天下午三点开个会吧，就是讨论一下官网首页的那个设计。',
    polish: '我们明天下午三点开个会，讨论一下官网首页的设计。',
    tr: {
      'en-US': "Let's meet tomorrow at 3 p.m. to go over the homepage design.",
      'ja-JP': '明日の午後3時に会議をして、トップページのデザインについて話し合いましょう。',
      'ko-KR': '내일 오후 3시에 회의해서 홈페이지 디자인을 논의합시다.',
    },
  },
  {
    said: '今天用顺口说试了一下 deep seek 整理出来的效果呃还挺自然的',
    off: '今天用顺口说试了一下 DeepSeek 整理出来的效果呃还挺自然的',
    fix: '今天用顺口说试了一下 DeepSeek，整理出来的效果，呃，还挺自然的。',
    polish: '今天用顺口说试了 DeepSeek，整理出来的效果很自然。',
    tr: {
      'en-US': 'I tried Sayso with DeepSeek today, and the cleaned-up text reads very naturally.',
      'ja-JP': '今日、顺口说で DeepSeek を試してみたところ、整えられた文章はとても自然でした。',
      'ko-KR': '오늘 Sayso로 DeepSeek을 써 봤는데, 정리된 문장이 아주 자연스러웠어요.',
    },
    dict: ['deep seek', 'DeepSeek'],
  },
  {
    said: '帮我把这个 bug 修一下就是用户点了保存以后那个列表没有刷新',
    off: '帮我把这个 bug 修一下就是用户点了保存以后那个列表没有刷新',
    fix: '帮我把这个 bug 修一下，就是用户点了保存以后，那个列表没有刷新。',
    polish: '帮我修一下这个 bug：用户点击保存后，列表没有刷新。',
    tr: {
      'en-US': "Please fix this bug: after the user clicks Save, the list doesn't refresh.",
      'ja-JP': 'このバグを直してください。ユーザーが保存をクリックしても、リストが更新されません。',
      'ko-KR': '이 버그 좀 고쳐 주세요. 사용자가 저장을 누른 뒤 목록이 새로 고쳐지지 않아요.',
    },
  },
]

export const targetLabel: Record<Target, string> = {
  'en-US': '英语（美国）',
  'ja-JP': '日语（日本）',
  'ko-KR': '韩语（韩国）',
}

export function outputFor(s: Sample, mode: 'dictate' | 'translate', cleanup: Cleanup, target: Target) {
  return mode === 'translate' ? s.tr[target] : s[cleanup]
}
