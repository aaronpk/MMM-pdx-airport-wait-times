const NodeHelper = require("node_helper")

module.exports = NodeHelper.create({

  async socketNotificationReceived(notification, payload) {
    if (notification === "FETCH_WAIT_TIMES") {
      try {
        const response = await fetch("https://launchpad.pin13.net/pdx/wait-times.php")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        this.sendSocketNotification("WAIT_TIMES_DATA", data)
      } catch (error) {
        console.error("Error fetching wait times:", error)
        this.sendSocketNotification("WAIT_TIMES_ERROR", error.message)
      }
      try {
        const response = await fetch(this.config.upcomingFlightsURL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        this.sendSocketNotification("VISIBLE", data.flights.length !== 0);
      } catch (error) {
        console.error("Error fetching flight data:", error)
        this.sendSocketNotification("VISIBLE", false);
      }
    }
  },
})
