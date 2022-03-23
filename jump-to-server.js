/** @param {NS} ns **/
var ns;

var servers = new Map();
var found = false;
var finalRoute;
var destination;

export async function main(nsInput) {
	ns = nsInput;

	destination = ns.args[0];

	if (destination == undefined) {
		ns.tprint("Missing destination. Usage is 'run jump-to-server.js server-name'");
		return;
	}

	servers = new Map();
	found = false;
	finalRoute = null;
	
	scanServer("home", []);

	if (!found) {
		ns.tprint(`Server ${destination} not found`);
		return;
	}

	printRoute();
}

function scanServer(hostname, route) {
	servers.set(hostname, route);

	var connectedServers = ns.scan(hostname);

	if (connectedServers.length === 0) {
		console.log("Found no connected servers for " + hostname);
		return;
	}

	connectedServers.forEach (connectedServer => {
		if (connectedServer === destination) {
			found = true;
			finalRoute = [...route, connectedServer];
		}
		
		if (!found && !servers.has(connectedServer)) {
			scanServer(connectedServer, [...route, connectedServer]);
		}
	});
}

function printRoute() {
	var output = "";

	finalRoute.forEach(s => { output += `connect ${s};` });
	output += "backdoor;"

	ns.tprintf(output);
}
