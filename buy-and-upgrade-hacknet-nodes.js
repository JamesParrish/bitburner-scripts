/** @param {NS} ns **/
var ns;

// Constants to set the maximum Level/RAM/Cores for a node
const maxLevel = 200;
const maxRam = 64;
const maxCores = 16;

// Constant to set the maximum price we're willing to pay for a new server
var maxNodePurchaseCost = 1000000000;

export async function main(nsInput) {
	ns = nsInput;

	var nodeCount = ns.hacknet.numNodes() - 1;

	var allUpgradesComplete = true;

  // Ensure all existing nodes are fully upgraded
	for (var nodeId = 0; nodeId <= nodeCount; nodeId++) {
		ns.tprint(`Upgrading ${nodeId}`);
		var upgradeComplete = upgradeNode(nodeId)
		allUpgradesComplete = allUpgradesComplete && upgradeComplete;
	}

  // If all nodes are fully upgraded, buy new nodes
	if (allUpgradesComplete) {
		ns.tprint(`Buying new nodes`);
		buyNodes();
	}
}

// Buy (and upgrade) as many new nodes as possible
function buyNodes() {
  // Buy new nodes while they're not too expensive
	while (ns.hacknet.getPurchaseNodeCost() <= maxNodePurchaseCost) {
    // Abort if we can't afford a new node
 		if (ns.hacknet.getPurchaseNodeCost() > getCurrentBalance()) {
			ns.tprint(`Insufficient cash to buy next node, aborting`);
			return;
		}
    
    // Buy new node
		var newNodeId = ns.hacknet.purchaseNode();
    
    // Upgrade the new node
		var upgradesComplete = upgradeNode(newNodeId);

    // Abort if we couldn't fully upgrade the new node
		if (!upgradesComplete) {
			ns.tprint(`Insufficient funds to fully upgrade new node`);
			return;
		}
	}

	ns.tprint(`Next node cost is too high, aborting (${ns.hacknet.getPurchaseNodeCost()} > ${maxNodePurchaseCost})`);
}

// Upgrade a node. Returns a boolean representing whether the node was fully upgraded
function upgradeNode(nodeId) {
  // Get node's current stats
	var node = ns.hacknet.getNodeStats(nodeId);
	
  // Upgrade node
	var ramUpgradesComplete = upgradeNodeRam(nodeId, node);
	var coreUpgradesComplete = upgradeNodeCores(nodeId, node);
	var levelUpgradesComplete = upgradeNodeLevel(nodeId, node);

	ns.tprint(`Upgraded node ${nodeId} - Max RAM: ${ramUpgradesComplete} / Max cores: ${coreUpgradesComplete} / Max levels: ${levelUpgradesComplete}`);

  // Return true if all features fully upgraded
	return ramUpgradesComplete && coreUpgradesComplete && levelUpgradesComplete;
}

// Upgrade a node's RAM. Returns a boolean representing whether the RAM was fully upgraded
function upgradeNodeRam(nodeId, node) {
  // For each upgrade remaining...
	for (var r = node.ram; r < maxRam; r = r*2) {
    // If we can't afford it, abort
		if (getCurrentBalance() < ns.hacknet.getRamUpgradeCost(nodeId, 1)) {
			ns.tprint(`Stopping: ${getCurrentBalance()} < ${ns.hacknet.getRamUpgradeCost(nodeId, 1)}`)
			return false;
		}

    // Upgrade the node's RAM
		ns.hacknet.upgradeRam(nodeId, 1);
	}

  // If all upgrades bought, return true
	return true;
}

// Upgrade a node's Cores. Returns a boolean representing whether the Cores were fully upgraded
function upgradeNodeCores(nodeId, node) {
  // For each upgrade remaining...
	for (var c = node.cores; c < maxCores; c++) {
    // If we can't afford it, abort
		if (getCurrentBalance() < ns.hacknet.getCoreUpgradeCost(nodeId, 1)) {
			ns.tprint(`Stopping: ${getCurrentBalance()} < ${ns.hacknet.getCoreUpgradeCost(nodeId, 1)}`)
			return false;
		}

    // Upgrade the node's Core
		ns.hacknet.upgradeCore(nodeId, 1);
	}

  // If all upgrades bought, return true
	return true;
}

// Upgrade a node's Level. Returns a boolean representing whether the Level was fully upgraded
function upgradeNodeLevel(nodeId, node) {
  // For each upgrade remaining...
	for (var l = node.level; l < maxLevel; l++) {
    // If we can't afford it, abort
		if (getCurrentBalance() < ns.hacknet.getLevelUpgradeCost(nodeId, 1)) {
			ns.tprint(`Stopping: ${getCurrentBalance()} < ${ns.hacknet.getLevelUpgradeCost(nodeId, 1)}`)
			return false;
		}

    // Upgrade the node's Level
		ns.hacknet.upgradeLevel(nodeId, 1);
	}

  // If all upgrades bought, return true
	return true;
}

// Get user's current balance
function getCurrentBalance() {
	return ns.getServerMoneyAvailable("home");
}
