document.addEventListener("DOMContentLoaded", () => {
    const menuButtons = document.querySelectorAll(".menu-button")
    const character = document.getElementById("character")
    const speechBubble = document.querySelector(".speech-bubble")

    // Messages for character
    const messages = [
        "今日も頑張りましょうね",
        "こんにちは！学習を始めましょう！",
        "やる気満々ですね！応援していますよ！",
        "一緒に成長していきましょう！",
        "素晴らしい！その調子です！",
    ]

    let currentMessageIndex = 0
    let characterMessageTimer = null

    // Initialize descriptions (so they exist without clicking)
    document.querySelectorAll(".description").forEach((desc) => {
        const buttonKey = desc.getAttribute("data-button")
        const button = document.querySelector(`.menu-button.${buttonKey}`)
        if (button) {
            desc.textContent = button.getAttribute("data-description") || ""
            desc.style.display = "none" // 明示的に非表示に
        }
    })

    // Helper to show/hide a description element
    const showDesc = (desc) => {
        if (!desc) return
        desc.classList.add("active")
        desc.style.display = "block"
    }
    const hideDesc = (desc) => {
        if (!desc) return
        desc.classList.remove("active")
        desc.style.display = "none"
    }

    // Add hover/focus/touch handlers so description shows only when hovering/focusing the button
    menuButtons.forEach((button) => {
        // description element matched by class (simulation/growth/settings)
        const buttonClass = Array.from(button.classList).find((c) => c !== "menu-button")
        const description = document.querySelector(`.description[data-button="${buttonClass}"]`)

        // Mouse: hover on the actual button element
        button.addEventListener("mouseenter", () => showDesc(description))
        button.addEventListener("mouseleave", () => hideDesc(description))

        // If button is wrapped by an <a>, also use the link's hover (some browsers focus anchor)
        const linkParent = button.closest("a")
        if (linkParent) {
            linkParent.addEventListener("mouseenter", () => showDesc(description))
            linkParent.addEventListener("mouseleave", () => hideDesc(description))
        }

        // Keyboard accessibility: focus/blur on button (and also focusin on wrapper to catch child focus)
        button.addEventListener("focus", () => showDesc(description))
        button.addEventListener("blur", () => hideDesc(description))

        const wrapper = button.closest(".button-wrapper")
        if (wrapper) {
            wrapper.addEventListener("focusin", (e) => {
                // only show when focus comes from the button or its link
                if (wrapper.contains(document.activeElement)) {
                    showDesc(description)
                }
            })
            wrapper.addEventListener("focusout", () => {
                // hide when focus leaves the wrapper
                setTimeout(() => {
                    // 少し遅延して移動先の判定を安定させる
                    if (!wrapper.contains(document.activeElement)) {
                        hideDesc(description)
                    }
                }, 0)
            })
        }

        // Touch devices: show description on touchstart for a short time
        let touchTimer = null
        button.addEventListener(
            "touchstart",
            (ev) => {
                showDesc(description)
                if (touchTimer) clearTimeout(touchTimer)
                touchTimer = setTimeout(() => hideDesc(description), 3000)
            },
            { passive: true },
        )

        const buttonDescription = button.getAttribute("data-description")

        button.addEventListener("mouseenter", () => {
            if (speechBubble && buttonDescription) {
                // Clear any active character message timer
                if (characterMessageTimer) {
                    clearTimeout(characterMessageTimer)
                    characterMessageTimer = null
                }

                speechBubble.style.display = "block"
                speechBubble.style.transition = "opacity 0.2s ease"
                speechBubble.style.opacity = "0"
                setTimeout(() => {
                    speechBubble.textContent = buttonDescription
                    speechBubble.style.opacity = "1"
                }, 200)
            }
        })

        button.addEventListener("mouseleave", () => {
            if (speechBubble) {
                speechBubble.style.transition = "opacity 0.2s ease"
                speechBubble.style.opacity = "0"
                setTimeout(() => {
                    speechBubble.textContent = ""
                    speechBubble.style.opacity = "1"
                    speechBubble.style.display = "none"
                }, 200)
            }
        })
    })

    if (character && speechBubble) {
        character.addEventListener("click", () => {
            currentMessageIndex = (currentMessageIndex + 1) % messages.length

            // Clear any existing timer
            if (characterMessageTimer) {
                clearTimeout(characterMessageTimer)
            }

            speechBubble.style.display = "block"
            speechBubble.style.transition = "opacity 0.2s ease"
            speechBubble.style.opacity = "0"
            setTimeout(() => {
                speechBubble.textContent = messages[currentMessageIndex]
                speechBubble.style.opacity = "1"
            }, 200)

            // Set timer to clear message after 10 seconds
            characterMessageTimer = setTimeout(() => {
                speechBubble.style.transition = "opacity 0.2s ease"
                speechBubble.style.opacity = "0"
                setTimeout(() => {
                    speechBubble.textContent = ""
                    speechBubble.style.opacity = "1"
                    speechBubble.style.display = "none"
                }, 200)
                characterMessageTimer = null
            }, 5000)
        })
    }

    // Update time in header
    function updateTime() {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, "0")
        const minutes = String(now.getMinutes()).padStart(2, "0")
        const timeElement = document.querySelector(".header-right")
        if (timeElement) {
            timeElement.textContent = `${hours}:${minutes}`
        }
    }

    updateTime()
    setInterval(updateTime, 60000) // Update every minute
})
