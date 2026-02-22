// src/app/components/SwipeToStart.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, useAnimation } from "motion/react";
import { ChevronsRight } from "lucide-react";

interface SwipeToStartProps {
    ticketId: string;
}

export function SwipeToStart({ ticketId }: SwipeToStartProps) {
    const navigate = useNavigate();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const controls = useAnimation();

    // The track is 350px wide. The knob is 56px + 4px padding on each side.
    // Maximum drag distance is 350 - 56 - 8 = 286px.
    const maxDrag = 286;

    const handleDragEnd = async (event: any, info: any) => {
        // If the user drags it more than 60% of the way, complete the action
        if (info.offset.x > maxDrag * 0.6) {
            setIsUnlocked(true);
            await controls.start({ x: maxDrag }); // Snap to the right edge

            // Wait a fraction of a second for the animation to feel good, then navigate
            setTimeout(() => {
                navigate(`/checklist/${ticketId}`);
            }, 250);
        } else {
            // If they didn't swipe far enough, snap it back to the start
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="w-[350px] max-w-[90vw] h-[64px] bg-white rounded-full p-1 shadow-[0px_0px_20px_rgba(0,0,0,0.20)] relative flex items-center overflow-hidden">

            {/* Background Text */}
            <span className="absolute w-full text-center text-[16px] text-[#322F35] font-medium z-0 pointer-events-none transition-opacity duration-300">
                {isUnlocked ? "Initiating..." : "Swipe to Start"}
            </span>

            {/* Draggable Yellow Knob */}
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