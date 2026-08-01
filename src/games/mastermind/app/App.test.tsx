import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import App, { type AudioPort } from "@/games/mastermind/app/App"
import type { Code } from "@/games/mastermind/game/types"

const secret: Code = ["coral", "amber", "mint", "cyan"]

function createAudio(): AudioPort {
  return { setEnabled: vi.fn(), play: vi.fn().mockResolvedValue(undefined) }
}

async function submitFourViolets(user: ReturnType<typeof userEvent.setup>) {
  const violet = screen.getByRole("button", { name: /选择葡萄色/ })
  await user.click(violet)
  await user.click(violet)
  await user.click(violet)
  await user.click(violet)
  await user.click(screen.getByRole("button", { name: "确认猜测" }))
}

describe("App", () => {
  it("renders six colors, four slots, and a disabled submit", () => {
    render(<App initialSecret={secret} audio={createAudio()} />)
    expect(screen.getAllByRole("button", { name: /^选择/ })).toHaveLength(6)
    expect(screen.getAllByLabelText(/^空位/)).toHaveLength(4)
    expect(screen.getByRole("button", { name: "确认猜测" })).toBeDisabled()
  })

  it("selects, removes, and submits a guess", async () => {
    const user = userEvent.setup()
    render(<App initialSecret={secret} audio={createAudio()} />)
    const coral = screen.getByRole("button", { name: "选择珊瑚色，编号 1" })
    await user.click(coral)
    await user.click(coral)
    await user.click(screen.getByRole("button", { name: "选择琥珀色，编号 2" }))
    await user.click(screen.getByRole("button", { name: "选择薄荷色，编号 3" }))
    await user.click(screen.getByRole("button", { name: "撤销上一枚颜色" }))
    expect(screen.getByRole("button", { name: "确认猜测" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "选择晴空色，编号 4" }))
    await user.click(screen.getByRole("button", { name: "确认猜测" }))
    expect(screen.getByLabelText(/个位置正确/)).toBeInTheDocument()
    const currentRow = screen.getByLabelText("正在填写第 2 次猜测")
    const submittedRow = screen.getByLabelText("第 1 次猜测")
    expect(currentRow.compareDocumentPosition(submittedRow) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("opens rules and restores focus when closed", async () => {
    const user = userEvent.setup()
    render(<App initialSecret={secret} audio={createAudio()} />)
    const trigger = screen.getByRole("button", { name: "查看玩法" })
    await user.click(trigger)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "关闭" }))
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("persists the sound setting and suppresses muted cues", async () => {
    const user = userEvent.setup()
    const audio = createAudio()
    const { unmount } = render(<App initialSecret={secret} audio={audio} />)
    await user.click(screen.getByRole("button", { name: /打开设置/ }))
    await user.click(screen.getByRole("switch", { name: "游戏音效" }))
    await user.click(screen.getByRole("button", { name: "关闭" }))
    expect(audio.setEnabled).toHaveBeenLastCalledWith(false)
    unmount()

    render(<App initialSecret={secret} audio={audio} />)
    expect(screen.getByRole("button", { name: "打开设置，音效已关闭" })).toBeInTheDocument()
  })

  it("wins, reveals the secret, and replays", async () => {
    const user = userEvent.setup()
    const audio = createAudio()
    render(<App initialSecret={secret} audio={audio} />)
    await user.click(screen.getByRole("button", { name: /选择珊瑚色/ }))
    await user.click(screen.getByRole("button", { name: /选择琥珀色/ }))
    await user.click(screen.getByRole("button", { name: /选择薄荷色/ }))
    await user.click(screen.getByRole("button", { name: /选择晴空色/ }))
    await user.click(screen.getByRole("button", { name: "确认猜测" }))
    expect(screen.getByText("密码破解成功")).toBeInTheDocument()
    expect(screen.getByLabelText("正确答案")).toBeInTheDocument()
    expect(audio.play).toHaveBeenLastCalledWith("win")
    const replay = screen.getByRole("button", { name: "再来一局" })
    expect(replay).toBeVisible()
    await user.click(replay)
    expect(screen.queryByText("密码破解成功")).not.toBeInTheDocument()
    expect(screen.getByLabelText("正在填写第 1 次猜测")).toBeInTheDocument()
  })

  it("loses after ten misses and reveals the secret", async () => {
    const user = userEvent.setup()
    const audio = createAudio()
    render(<App initialSecret={secret} audio={audio} />)

    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)
    await submitFourViolets(user)

    expect(screen.getByText("这局差一点")).toBeInTheDocument()
    expect(screen.getByLabelText("正确答案")).toBeInTheDocument()
    expect(audio.play).toHaveBeenLastCalledWith("lose")
    const replay = screen.getByRole("button", { name: "再来一局" })
    expect(replay).toBeVisible()
    await user.click(replay)
    expect(screen.queryByText("这局差一点")).not.toBeInTheDocument()
    expect(screen.getByLabelText("正在填写第 1 次猜测")).toBeInTheDocument()
  })
})
