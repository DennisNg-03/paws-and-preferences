import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

type CardData = {
	id: number;
	url: string;
};

interface CardProps {
	card: CardData;
	cards: CardData[];
	setCards: React.Dispatch<React.SetStateAction<CardData[]>>;
	onSwipe: (direction: "left" | "right", card: CardData) => void;
	onLoad: (id: number) => void;
	isFrontLoaded: boolean;
}

type SwipeHistory = {
	card: CardData;
	direction: "left" | "right";
};

const CAT_COUNT = 12;
const SWIPE_THRESHOLD = 60;
const CATS_KEY = "cats";
// const LIKED_CATS_KEY = "likedCats";

const CatDeck = () => {
	const [loading, setLoading] = useState(false);
	const [cards, setCards] = useState<CardData[]>([]);
	const [showSummary, setShowSummary] = useState(false);
	const [history, setHistory] = useState<SwipeHistory[]>([]);

	const progress = CAT_COUNT - cards.length + 1;
	const currentIndex = Math.min(progress, CAT_COUNT);

	const [frontLoaded, setFrontLoaded] = useState(false);

	const handleFrontLoad = (id: number) => {
		if (cards.length && id === cards[cards.length - 1].id) {
			setFrontLoaded(true);
		}
	};

	// const getLikedCatsFromStorage = (): CardData[] => {
	// 	const stored = localStorage.getItem(LIKED_CATS_KEY);
	// 	return stored ? JSON.parse(stored) : [];
	// };
	const [liked, setLiked] = useState<CardData[]>([]);
	// const allLikedCats = JSON.parse(localStorage.getItem(LIKED_CATS_KEY) || "[]");

	const fetchCats = async () => {
		setLoading(true);
		setFrontLoaded(false);

		const cached = localStorage.getItem(CATS_KEY);
		if (cached) {
			setCards(JSON.parse(cached));
			setLoading(false);
			return;
		}

		const idsSet = new Set<number>();
		const cardsArr: CardData[] = [];

		while (cardsArr.length < CAT_COUNT) {
			const res = await fetch("https://cataas.com/cat?json=true");
			const data = await res.json();

			if (idsSet.has(data.id)) continue; // skip duplicates

			idsSet.add(data.id);
			const url = `https://cataas.com/cat/${data.id}`;

			await new Promise<void>((resolve) => { // preload images
				const img = new Image();
				img.src = url;
				img.onload = () => resolve();
				img.onerror = () => resolve();
			});

			cardsArr.push({ id: cardsArr.length + 1, url });
		}

		setCards(cardsArr);
		localStorage.setItem(CATS_KEY, JSON.stringify(cardsArr));
		setLoading(false);
	};

	useEffect(() => {
		(async () => {
			await fetchCats();
		})();
	}, []);

	const undoLast = () => {
		const last = history.at(-1);
		if (!last) return;

		setHistory((h) => h.slice(0, -1));
		setCards((c) => [...c, last.card]);

		if (last.direction === "right") {
			setLiked((prev) => {
				const newLiked = prev.filter((cat) => cat.id !== last.card.id);
				// localStorage.setItem(LIKED_CATS_KEY, JSON.stringify(newLiked));
				return newLiked;
			});
		}
	};

	if (loading) {
		return (
			<div className="min-h-full h-125 grid place-items-center">
				<div className="animate-pulse text-gray-400 text-lg">
					Loading cats… This might take a while...
				</div>
			</div>
		);
	}

	if (showSummary) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				className="
					flex flex-col
					justify-center
					min-h-[60vh]
					p-6
					space-y-6
				"
			>
				<h2 className="text-2xl font-bold text-gray-800">
					You liked {liked.length} cats 🐱
				</h2>

				<div className="flex gap-4 overflow-x-auto pb-2">
					{liked.map((cat) => (
						<img
							key={cat.id}
							src={cat.url}
							className="
								h-[45vh] w-[55vw]
								sm:h-[50vh] sm:w-[55vw]
								lg:h-[60vh] lg:w-[60vw]
								max-h-130 max-w-90
								rounded-2xl object-cover shrink-0
							"
							alt="Liked cat"
						/>
					))}
				</div>

				<div
					className="
						flex flex-col gap-3
						sm:flex-row sm:justify-between sm:gap-4
					"
				>
					<button
						onClick={() => {
							localStorage.removeItem(CATS_KEY);
							setCards([]);
							setHistory([]);
							setLiked([]);
							setFrontLoaded(false);
							setShowSummary(false);
							fetchCats();
						}}
						className="
            px-6 py-3 rounded-full
            bg-rose-400 hover:bg-rose-500
            text-white font-medium
            transition shadow-md hover:shadow-lg
          "
					>
						New Deck
					</button>

					<button
						onClick={() => {
							setShowSummary(false);
						}}
						className="
            px-6 py-3 rounded-full
            bg-emerald-400 hover:bg-emerald-500
            text-white font-medium
            transition shadow-md hover:shadow-lg
          "
					>
						Continue swiping
					</button>
				</div>
			</motion.div>
		);
	}

	return (
		<>
			{/* {cards.length > 0 && !frontLoaded && (
				<div className="fixed inset-0 grid place-items-center bg-black/70 z-50">
					<div className="animate-pulse text-gray-400 text-lg">
						Loading cats… This might take a while...
					</div>
				</div>
			)} */}
			{/* Progress bar */}
			<div className="min-h-full flex items-center justify-between px-6 pt-10 sm:pt-6 pb-3">
				<div className="text-sm text-gray-500">
					{currentIndex} / {CAT_COUNT}
				</div>

				<button
					onClick={undoLast}
					disabled={history.length === 0}
					className="
						text-sm text-gray-700 not-[]:disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed hover:shadow-lg"
				>
					Undo
				</button>
			</div>

			<div
				className="
					relative h-125 w-full
					grid place-items-center
					overflow-hidden
				"
			>
				{cards.length === 0 && !loading && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex flex-col items-center gap-2 text-gray-700"
					>
						<p className="text-lg font-medium">That’s all for now 🐾</p>
						<p className="text-sm text-gray-500">
							You’ve swiped through all the cats
						</p>
					</motion.div>
				)}
				{cards.map((card) => (
					<Card
						key={card.id}
						card={card}
						cards={cards}
						setCards={setCards}
						onSwipe={(direction, card) => {
							setHistory((history) => [...history, { card, direction }]);

							if (direction === "right") {
								setLiked((prev) => {
									const newLiked = [...prev, card];
									// localStorage.setItem(
									// 	LIKED_CATS_KEY,
									// 	JSON.stringify(newLiked)
									// );
									return newLiked;
								});
							}
						}}
						onLoad={handleFrontLoad}
						isFrontLoaded={frontLoaded}
					/>
				))}
			</div>

			<div className="flex justify-center py-6">
				<button
					onClick={() => setShowSummary(true)}
					className="px-6 py-3 rounded-full bg-sky-400 hover:bg-sky-500 text-white cursor-pointer shadow-md hover:shadow-lg"
				>
					View summary
				</button>
			</div>
		</>
	);
};

const Card: React.FC<CardProps> = ({
	card,
	cards,
	setCards,
	onSwipe,
	onLoad,
	isFrontLoaded,
}) => {
	const x = useMotionValue(0);
	const isFront = card.id === cards[cards.length - 1].id;
	const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
	const rotate = useTransform(() => {
		const offset = isFront ? 0 : card.id % 2 ? 6 : -6;
		return `${rotateRaw.get() + offset}deg`;
	});

	const opacity = useTransform(x, [-150, 0, 150], [0, 1, 0]);
	const bgColor = useTransform(
		x,
		[-150, 0, 150],
		[
			"rgba(239,68,68,0.25)", // red
			"rgba(0,0,0,0)", // transparent
			"rgba(34,197,94,0.25)", // green
		]
	);
	const likeBgOpacity = useTransform(x, [40, SWIPE_THRESHOLD], [0, 1]);
	const dislikeBgOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40], [1, 0]);

	const handleDragEnd = () => {
		const xValue = x.get();

		if (Math.abs(xValue) > SWIPE_THRESHOLD) {
			// Right swipe -> x > 70, Like
			const direction = xValue > 0 ? "right" : "left";

			navigator.vibrate?.(20); // 20ms haptic feedback to signal decision confirmed

			onSwipe(direction, card);

			setCards((pv) => pv.filter((v) => v.id !== card.id));
		}
	};

	return (
		<>
			{isFront && (
				<>
					<motion.div
						className="absolute inset-0"
						style={{ backgroundColor: bgColor }}
					/>

					<motion.div
						className="absolute left-6 top-1/2 -translate-y-1/2
        text-red-500 text-2xl font-bold tracking-wide"
						style={{ opacity: dislikeBgOpacity }}
					>
						PASS
					</motion.div>

					<motion.div
						className="absolute right-6 top-1/2 -translate-y-1/2
        text-green-500 text-2xl font-bold tracking-wide"
						style={{ opacity: likeBgOpacity }}
					>
						LIKE
					</motion.div>
				</>
			)}

			<motion.div
				className="relative h-96 w-72"
				style={{
					gridRow: 1,
					gridColumn: 1,
					x,
					rotate,
					opacity,
					pointerEvents: isFront ? "auto" : "none",
					boxShadow: isFront
						? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
						: undefined,
				}}
				animate={{ scale: isFront ? 1 : 0.98 }}
				whileHover={isFront ? { scale: 1.02 } : undefined}
				// drag={isFront ? "x" : false}
				drag={isFront ? (isFrontLoaded ? "x" : false) : false}
				dragDirectionLock
				dragConstraints={{ left: 0, right: 0 }}
				onDragEnd={handleDragEnd}
			>
				{/* Card image */}
				<motion.img
					src={card.url}
					alt="Cat"
					className="h-full w-full rounded-lg object-cover cursor-grab active:cursor-grabbing"
					style={{ opacity }}
					draggable={false}
					onLoad={() => onLoad(card.id)}
				/>
			</motion.div>
		</>
	);
};

export default CatDeck;
