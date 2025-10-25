using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SmartCCTV.API.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("email")]
        public string? Email { get; set; }

        [BsonElement("password")]
        public string? Password { get; set; }

        [BsonElement("fullName")]
        public string? FullName { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; }

        [BsonElement("devices")]
        public List<Device> Devices { get; set; } = new List<Device>();
    }

    public class Device
    {
        [BsonElement("deviceId")]
        public string? DeviceId { get; set; }

        [BsonElement("deviceName")]
        public string? DeviceName { get; set; }

        [BsonElement("deviceType")]
        public string? DeviceType { get; set; } // "camera" or "monitor"

        [BsonElement("lastSeen")]
        public DateTime LastSeen { get; set; }

        [BsonElement("isOnline")]
        public bool IsOnline { get; set; }
    }
}