import cat from '../assets/cat.json';
import Lottie from "lottie-react"

export default function CatLottie({ width = "480px", height = "280px" }) {
    return (
        <Lottie
            animationData={cat}
            loop={true}
            autoplay={true}
            style={{ width, height }}
        />
    )
}