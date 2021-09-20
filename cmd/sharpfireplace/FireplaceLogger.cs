using System.Collections.Generic;

namespace sharpfireplace
{
    public class FireplaceLogger
    {
        public static Entry NewLogger(string application, Level level, string fireplaceURL, string password, Dictionary<string, object> fields)
        {
            Logger l = new Logger();
            l.Level = level;

            l.AddHook(new FireplaceHook(new FireplaceHookConfig()
            {
                Application = application,
                FireplaceURL = fireplaceURL,
                Password = password
            }));

            Entry result;

            if (fields != null)
            {
                result = l.WithFields(fields);
            }
            else
            {
                result = l.NewEntry();
            }

            return result;
        }
    }
}
