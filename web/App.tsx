import { useEffect, useState } from "react";
import type { HealthResponse } from "../src/contracts/common";

type ApiState = "checking" | "ok" | "unreachable";

function App() {
	const [api, setApi] = useState<ApiState>("checking");

	useEffect(() => {
		fetch("/api/health")
			.then((res) => res.json() as Promise<HealthResponse>)
			.then((data) => setApi(data.status === "ok" ? "ok" : "unreachable"))
			.catch(() => setApi("unreachable"));
	}, []);

	return (
		<main>
			<h1>Setter Diary</h1>
			<p>Version {__APP_VERSION__}</p>
			<p>API: {api}</p>
		</main>
	);
}

export default App;
