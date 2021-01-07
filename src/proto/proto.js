/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.messagepackage = (function() {

    /**
     * Namespace messagepackage.
     * @exports messagepackage
     * @namespace
     */
    var messagepackage = {};

    messagepackage.Message = (function() {

        /**
         * Properties of a Message.
         * @memberof messagepackage
         * @interface IMessage
         * @property {string} msgId Message msgId
         * @property {number} type Message type
         * @property {number} sessionType Message sessionType
         * @property {string|null} [content] Message content
         * @property {number} status Message status
         * @property {number} sender Message sender
         * @property {number} reciver Message reciver
         * @property {number|Long|null} [time] Message time
         * @property {string|null} [ext] Message ext
         */

        /**
         * Constructs a new Message.
         * @memberof messagepackage
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {messagepackage.IMessage=} [properties] Properties to set
         */
        function Message(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Message msgId.
         * @member {string} msgId
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.msgId = "";

        /**
         * Message type.
         * @member {number} type
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.type = 0;

        /**
         * Message sessionType.
         * @member {number} sessionType
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.sessionType = 0;

        /**
         * Message content.
         * @member {string} content
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.content = "";

        /**
         * Message status.
         * @member {number} status
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.status = 0;

        /**
         * Message sender.
         * @member {number} sender
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.sender = 0;

        /**
         * Message reciver.
         * @member {number} reciver
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.reciver = 0;

        /**
         * Message time.
         * @member {number|Long} time
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Message ext.
         * @member {string} ext
         * @memberof messagepackage.Message
         * @instance
         */
        Message.prototype.ext = "";

        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage=} [properties] Properties to set
         * @returns {messagepackage.Message} Message instance
         */
        Message.create = function create(properties) {
            return new Message(properties);
        };

        /**
         * Encodes the specified Message message. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.msgId);
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.type);
            writer.uint32(/* id 3, wireType 0 =*/24).int32(message.sessionType);
            if (message.content != null && Object.hasOwnProperty.call(message, "content"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.content);
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.status);
            writer.uint32(/* id 6, wireType 0 =*/48).int32(message.sender);
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.reciver);
            if (message.time != null && Object.hasOwnProperty.call(message, "time"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.time);
            if (message.ext != null && Object.hasOwnProperty.call(message, "ext"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.ext);
            return writer;
        };

        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link messagepackage.Message.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.Message();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.msgId = reader.string();
                    break;
                case 2:
                    message.type = reader.int32();
                    break;
                case 3:
                    message.sessionType = reader.int32();
                    break;
                case 4:
                    message.content = reader.string();
                    break;
                case 5:
                    message.status = reader.int32();
                    break;
                case 6:
                    message.sender = reader.int32();
                    break;
                case 7:
                    message.reciver = reader.int32();
                    break;
                case 8:
                    message.time = reader.int64();
                    break;
                case 9:
                    message.ext = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msgId"))
                throw $util.ProtocolError("missing required 'msgId'", { instance: message });
            if (!message.hasOwnProperty("type"))
                throw $util.ProtocolError("missing required 'type'", { instance: message });
            if (!message.hasOwnProperty("sessionType"))
                throw $util.ProtocolError("missing required 'sessionType'", { instance: message });
            if (!message.hasOwnProperty("status"))
                throw $util.ProtocolError("missing required 'status'", { instance: message });
            if (!message.hasOwnProperty("sender"))
                throw $util.ProtocolError("missing required 'sender'", { instance: message });
            if (!message.hasOwnProperty("reciver"))
                throw $util.ProtocolError("missing required 'reciver'", { instance: message });
            return message;
        };

        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Message message.
         * @function verify
         * @memberof messagepackage.Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isString(message.msgId))
                return "msgId: string expected";
            if (!$util.isInteger(message.type))
                return "type: integer expected";
            if (!$util.isInteger(message.sessionType))
                return "sessionType: integer expected";
            if (message.content != null && message.hasOwnProperty("content"))
                if (!$util.isString(message.content))
                    return "content: string expected";
            if (!$util.isInteger(message.status))
                return "status: integer expected";
            if (!$util.isInteger(message.sender))
                return "sender: integer expected";
            if (!$util.isInteger(message.reciver))
                return "reciver: integer expected";
            if (message.time != null && message.hasOwnProperty("time"))
                if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                    return "time: integer|Long expected";
            if (message.ext != null && message.hasOwnProperty("ext"))
                if (!$util.isString(message.ext))
                    return "ext: string expected";
            return null;
        };

        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.Message
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.Message} Message
         */
        Message.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.Message)
                return object;
            var message = new $root.messagepackage.Message();
            if (object.msgId != null)
                message.msgId = String(object.msgId);
            if (object.type != null)
                message.type = object.type | 0;
            if (object.sessionType != null)
                message.sessionType = object.sessionType | 0;
            if (object.content != null)
                message.content = String(object.content);
            if (object.status != null)
                message.status = object.status | 0;
            if (object.sender != null)
                message.sender = object.sender | 0;
            if (object.reciver != null)
                message.reciver = object.reciver | 0;
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
            if (object.ext != null)
                message.ext = String(object.ext);
            return message;
        };

        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.Message
         * @static
         * @param {messagepackage.Message} message Message
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Message.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.msgId = "";
                object.type = 0;
                object.sessionType = 0;
                object.content = "";
                object.status = 0;
                object.sender = 0;
                object.reciver = 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
                object.ext = "";
            }
            if (message.msgId != null && message.hasOwnProperty("msgId"))
                object.msgId = message.msgId;
            if (message.type != null && message.hasOwnProperty("type"))
                object.type = message.type;
            if (message.sessionType != null && message.hasOwnProperty("sessionType"))
                object.sessionType = message.sessionType;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = message.content;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            if (message.sender != null && message.hasOwnProperty("sender"))
                object.sender = message.sender;
            if (message.reciver != null && message.hasOwnProperty("reciver"))
                object.reciver = message.reciver;
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
            if (message.ext != null && message.hasOwnProperty("ext"))
                object.ext = message.ext;
            return object;
        };

        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof messagepackage.Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Message;
    })();

    messagepackage.AckResponse = (function() {

        /**
         * Properties of an AckResponse.
         * @memberof messagepackage
         * @interface IAckResponse
         * @property {number} code AckResponse code
         * @property {string} msg AckResponse msg
         */

        /**
         * Constructs a new AckResponse.
         * @memberof messagepackage
         * @classdesc Represents an AckResponse.
         * @implements IAckResponse
         * @constructor
         * @param {messagepackage.IAckResponse=} [properties] Properties to set
         */
        function AckResponse(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AckResponse code.
         * @member {number} code
         * @memberof messagepackage.AckResponse
         * @instance
         */
        AckResponse.prototype.code = 0;

        /**
         * AckResponse msg.
         * @member {string} msg
         * @memberof messagepackage.AckResponse
         * @instance
         */
        AckResponse.prototype.msg = "";

        /**
         * Creates a new AckResponse instance using the specified properties.
         * @function create
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse=} [properties] Properties to set
         * @returns {messagepackage.AckResponse} AckResponse instance
         */
        AckResponse.create = function create(properties) {
            return new AckResponse(properties);
        };

        /**
         * Encodes the specified AckResponse message. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @function encode
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse} message AckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AckResponse.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.code);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.msg);
            return writer;
        };

        /**
         * Encodes the specified AckResponse message, length delimited. Does not implicitly {@link messagepackage.AckResponse.verify|verify} messages.
         * @function encodeDelimited
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.IAckResponse} message AckResponse message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AckResponse.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AckResponse message from the specified reader or buffer.
         * @function decode
         * @memberof messagepackage.AckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {messagepackage.AckResponse} AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AckResponse.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.messagepackage.AckResponse();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.code = reader.int32();
                    break;
                case 2:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("code"))
                throw $util.ProtocolError("missing required 'code'", { instance: message });
            if (!message.hasOwnProperty("msg"))
                throw $util.ProtocolError("missing required 'msg'", { instance: message });
            return message;
        };

        /**
         * Decodes an AckResponse message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof messagepackage.AckResponse
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {messagepackage.AckResponse} AckResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AckResponse.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AckResponse message.
         * @function verify
         * @memberof messagepackage.AckResponse
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AckResponse.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.code))
                return "code: integer expected";
            if (!$util.isString(message.msg))
                return "msg: string expected";
            return null;
        };

        /**
         * Creates an AckResponse message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof messagepackage.AckResponse
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {messagepackage.AckResponse} AckResponse
         */
        AckResponse.fromObject = function fromObject(object) {
            if (object instanceof $root.messagepackage.AckResponse)
                return object;
            var message = new $root.messagepackage.AckResponse();
            if (object.code != null)
                message.code = object.code | 0;
            if (object.msg != null)
                message.msg = String(object.msg);
            return message;
        };

        /**
         * Creates a plain object from an AckResponse message. Also converts values to other types if specified.
         * @function toObject
         * @memberof messagepackage.AckResponse
         * @static
         * @param {messagepackage.AckResponse} message AckResponse
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AckResponse.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.code = 0;
                object.msg = "";
            }
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.msg != null && message.hasOwnProperty("msg"))
                object.msg = message.msg;
            return object;
        };

        /**
         * Converts this AckResponse to JSON.
         * @function toJSON
         * @memberof messagepackage.AckResponse
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AckResponse.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AckResponse;
    })();

    return messagepackage;
})();

module.exports = $root;
