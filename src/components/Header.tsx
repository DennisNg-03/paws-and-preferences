const Header = () => {
	return (
		<div
			className="
			w-full px-6 py-4
			bg-linear-to-r from-rose-100 via-amber-100 to-emerald-100
			rounded-b-3xl
			shadow-sm
		"
		>
			<h1
				className="
					text-2xl sm:text-4xl
					font-extrabold
					text-gray-800
					text-center
					tracking-tight
				"
			>
				Pick your Favourite Kitty 🐾
			</h1>

			<p className="text-center text-sm text-gray-600 mt-1">
				Swipe right to like, left to pass
			</p>
		</div>
	);
};

export default Header;
