Module.register("MMM-pdx-airport-wait-times", {

  defaults: {
    updateInterval: 120000, // 2 minutes in milliseconds
    showBCStandard: true,
    showBCPreCheck: true,
    showDEStandard: true,
    showDEPreCheck: true
  },

  /**
   * Apply the default styles.
   */
  getStyles() {
    return ["template.css"]
  },

  /**
   * Pseudo-constructor for our module. Initialize stuff here.
   */
  start() {
    this.waitTimes = null
    this.loaded = false

    // Request initial data
    this.fetchWaitTimes()

    // Set up periodic updates every 2 minutes
    setInterval(() => this.fetchWaitTimes(), this.config.updateInterval)
  },

  /**
   * Handle notifications received by the node helper.
   * So we can communicate between the node helper and the module.
   *
   * @param {string} notification - The notification identifier.
   * @param {any} payload - The payload data returned by the node helper.
   */
  socketNotificationReceived: function (notification, payload) {
    if (notification === "WAIT_TIMES_DATA") {
      this.waitTimes = payload
      this.loaded = true
      this.updateDom()
    } else if (notification === "WAIT_TIMES_ERROR") {
      Log.error("Error fetching wait times:", payload)
      this.loaded = true
      this.updateDom()
    }
  },

  /**
   * Render the page we're on.
   */
  getDom() {
    const wrapper = document.createElement("div")

    if (!this.loaded) {
      wrapper.innerHTML = "Loading wait times..."
      return wrapper
    }

    if (!this.waitTimes) {
      wrapper.innerHTML = "No data available"
      return wrapper
    }

    // Create the wait times display based on config
    let showCheckpointLabel = (this.config.showBCStandard && this.config.showBCPreCheck) || this.config.showDEStandard && this.config.showDEPreCheck;
    let html = "<div class='wait-times'>"
    if (this.config.showBCStandard || this.config.showBCPreCheck) {
      html += `<div class='checkpoint'>Checkpoint B/C</div>`
      if (this.config.showBCStandard) {
        html += `<div class='time ${showCheckpointLabel ? '' : 'nolabel'}'>${showCheckpointLabel ? 'Standard: ' : ''}${this.waitTimes.b_c_standard} min</div>`
      }
      if (this.config.showBCPreCheck) {
        html += `<div class='time ${showCheckpointLabel ? '' : 'nolabel'}'>${showCheckpointLabel ? 'PreCheck: ' : ''}${this.waitTimes.b_c_precheck} min</div>`
      }
    }
    if (this.config.showDEStandard || this.config.showDEPreCheck) {
      html += `<div class='checkpoint'>Checkpoint D/E</div>`
      if (this.config.showDEStandard) {
        html += `<div class='time ${showCheckpointLabel ? '' : 'nolabel'}'>${showCheckpointLabel ? 'Standard: ' : ''}${this.waitTimes.d_e_standard} min</div>`
      }
      if (this.config.showDEPreCheck) {
        html += `<div class='time ${showCheckpointLabel ? '' : 'nolabel'}'>${showCheckpointLabel ? 'PreCheck: ' : ''}${this.waitTimes.d_e_precheck} min</div>`
      }
    }
    html += "</div>"

    wrapper.innerHTML = html
    return wrapper
  },

  fetchWaitTimes() {
    this.sendSocketNotification("FETCH_WAIT_TIMES")
  },

})
