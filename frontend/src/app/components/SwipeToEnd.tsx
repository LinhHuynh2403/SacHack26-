// src/app/components/SwipeToEnd.tsx
import { useState } from "react";
import { motion, useAnimation } from "motion/react";
import { ChevronsRight } from "lucide-react";

interface SwipeToEndProps {
    onComplete: () => Promise<void> | void;
}

export function SwipeToEnd({ onComplete }: SwipeToEndProps) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const controls = useAnimation();
    const maxDrag = 286; // Total track width (350) minus knob width (56) minus padding (8)

    const handleDragEnd = async (event: any, info: any) => {
        if (info.offset.x > maxDrag * 0.6) {
            setIsUnlocked(true);
            await controls.start({ x: maxDrag });

            // Wait a fraction of a second for the animation to finish, then trigger completion
            setTimeout(async () => {
                await onComplete();
            }, 250);
        } else {
            // Snap back if they didn't swipe far enough
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="w-[350px] max-w-[90vw] h-[64px] bg-white rounded-full p-1 shadow-[0px_0px_20px_rgba(0,0,0,0.20)] relative flex items-center overflow-hidden">
            <span className="absolute w-full text-center text-[16px] text-[#322F35] font-medium z-0 pointer-events-none transition-opacity duration-300">
                {isUnlocked ? "Completing..." : "Swipe to End"}
            </span>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                onDragEnd={handleDragEnd}
                animate={controls}
                className="w-[56px] h-[56px] bg-[#FFF28B] rounded-full flex items-center justify-center relative z-10 cursor-grab active:cursor-grabbing shadow-sm"
            >
                <ChevronsRight className="w-7 h-7 text-[#4A4458]" />
            </motion.div>
        </div>
    );
}