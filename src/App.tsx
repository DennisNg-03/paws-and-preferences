import "./App.css";
import CatDeck from "./components/CatDeck";
import Header from "./components/Header";

function App() {
	return (
		<>
			<div>
				<div className="min-h-screen flex flex-col">
					<Header />
					<main className="flex-1">
						<CatDeck />
					</main>
				</div>
			</div>
		</>
	);
}

export default App;
