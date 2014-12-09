using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.Text;
using System.Threading.Tasks;

namespace Hyperlapse_GPX
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class Strava : IStrava
    {
        public string Auth(string code)
        {
            return _auth(code).Result;
        }

        private async Task<string> _auth(string code)
        {
            using (var client = new HttpClient())
            {
                var values = new List<KeyValuePair<string, string>>();
                values.Add(new KeyValuePair<string, string>("client_id", "3822"));
                values.Add(new KeyValuePair<string, string>("client_secret", "9fb012fc248d89c67b42278bd54adf13779195a9"));
                values.Add(new KeyValuePair<string, string>("code", code));

                var content = new FormUrlEncodedContent(values);

                var response = await client.PostAsync("https://www.strava.com/oauth/token", content);

                var responseString = await response.Content.ReadAsStringAsync();

                return responseString;
            }

        }

        public string Gpx(string access_token, string id)
        {
            return _gpx(access_token, id).Result;
        }

        private async Task<string> _gpx(string access_token, string id)
        {
            using (var client = new HttpClient())
            {
                var values = new List<KeyValuePair<string, string>>();
                values.Add(new KeyValuePair<string, string>("client_id", "3822"));
                values.Add(new KeyValuePair<string, string>("access_token", access_token));
              
                var content = new FormUrlEncodedContent(values);

                var url = "https://www.strava.com/activities/" + id + "/export_gpx?access_token=" + access_token;

                var response = await client.PostAsync(url, content);

                var responseString = await response.Content.ReadAsStringAsync();

                return responseString;
            }

        }

    }
}
