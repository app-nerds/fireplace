/**
 * NewFireplaceClient returns a new client used to communicate with a Fireplace Server.
 * This client is designed to be used like a logger library.
 * @param {string} baseURL FQDN to a Fireplace Server
 * @param {string} serverPassword The password with write access to the Fireplace Server
 * @param {string} application The name of the application that will be sending log entries
 */
export function NewFireplaceClient(baseURL = "http://localhost:8999", serverPassword = "", application = "") {
   let _writeLog = async (level, message, details = []) => {
      let lowerLevel = level.toLowerCase();

      if (!_isValidLevel(lowerLevel)) {
         throw new Error(`invalid log level ${lowerLevel}`);
      }

      let payload = {
         "application": application,
         "level": lowerLevel,
         "message": message,
         "time": new Date().toISOString(),
         "details": details
      };

      let options = {
         method: "POST",
         headers: {
            "Authorization": `Bearer ${serverPassword}`,
            "Content-Type": "application/json"
         },
         body: JSON.stringify(payload)
      };

      let response = await fetch(`${baseURL}/logentry`, options);
      let body = await response.text();

      if (!response.ok) {
         throw new Error(body);
      }

      return body;
   };

   let _isValidLevel = (level) => {
      return ["debug", "warning", "info", "error", "fatal", "panic"].includes(level.toLowerCase());
   };

   let _getSimpleWriter = (level = "") => {
      return (message = "", details = []) => {
         return _writeLog(level, message, details);)
      };
   };

   return {
      Debug: _getSimpleWriter("debug"),
      Warning: _getSimpleWriter("warning"),
      Info: _getSimpleWriter("info"),
      Error: _getSimpleWriter("error"),
      Fatal: _getSimpleWriter("fatal"),
      Panic: _getSimpleWriter("panic")
   };
}