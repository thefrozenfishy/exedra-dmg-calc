import { type Character } from "../types/KiokuTypes"

const VALUE_OF_UNOWNED_DIFF = 3

export function getAccountSimilarityScore(
    myChars: Character[],
    otherChars: Character[]
): number {
    const myFiveStars = myChars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")
    const otherFiveStars = otherChars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")
    let total = 0
    let max = 0

    for (const char of myFiveStars) {
        const otherChar = otherFiveStars.find(ch => ch.id === char.id)
        if (!otherChar) continue
        if (!char.enabled && !otherChar.enabled) continue
        const myAsc = char.enabled ? char.ascension : 0
        const otherAsc = otherChar.enabled ? otherChar.ascension : 0
        console.log(`Comparing ${char.name}: from ${total}, ${max}, myAsc ${myAsc}, otherAsc ${otherAsc}`)

        total += Math.abs(myAsc - otherAsc)
        total += Math.abs(Number(char.enabled) - Number(otherChar.enabled)) * VALUE_OF_UNOWNED_DIFF
        max += 5 + VALUE_OF_UNOWNED_DIFF
        console.log(`Comparing ${char.name}: to ${total}, ${max}, myAsc ${myAsc}, otherAsc ${otherAsc}`)
    }

    return 100 - Math.round(100 * total / max)
}