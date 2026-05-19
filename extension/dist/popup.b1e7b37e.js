
      var $parcel$global = globalThis;
    /******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var $12716e7fca7b0c49$var$extendStatics = function(d, b) {
    $12716e7fca7b0c49$var$extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return $12716e7fca7b0c49$var$extendStatics(d, b);
};
function $12716e7fca7b0c49$export$a8ba968b8961cb8a(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    $12716e7fca7b0c49$var$extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var $12716e7fca7b0c49$export$18ce0697a983be9b = function() {
    $12716e7fca7b0c49$export$18ce0697a983be9b = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return $12716e7fca7b0c49$export$18ce0697a983be9b.apply(this, arguments);
};
function $12716e7fca7b0c49$export$3c9a16f847548506(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function $12716e7fca7b0c49$export$29e00dfd3077644b(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function $12716e7fca7b0c49$export$d5ad3fd78186038f(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function $12716e7fca7b0c49$export$3a84e1ae4e97e9b0(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function $12716e7fca7b0c49$export$d831c04e792af3d(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++)value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    return useValue ? value : void 0;
}
function $12716e7fca7b0c49$export$6a2a36740a146cb8(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
function $12716e7fca7b0c49$export$d1a06452d3489bc7(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
function $12716e7fca7b0c49$export$f1db080c865becb9(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function $12716e7fca7b0c49$export$1050f835b63b671e(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function $12716e7fca7b0c49$export$67ebef60e6f28a6(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var $12716e7fca7b0c49$export$45d3717a4c69092e = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function $12716e7fca7b0c49$export$f33643c0debef087(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) $12716e7fca7b0c49$export$45d3717a4c69092e(o, m, p);
}
function $12716e7fca7b0c49$export$19a8beecd37a4c45(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function $12716e7fca7b0c49$export$8d051b38c9118094(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function $12716e7fca7b0c49$export$afc72e2116322959() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat($12716e7fca7b0c49$export$8d051b38c9118094(arguments[i]));
    return ar;
}
function $12716e7fca7b0c49$export$6388937ca91ccae8() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function $12716e7fca7b0c49$export$1216008129fb82ed(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function $12716e7fca7b0c49$export$10c90e4f7922046c(v) {
    return this instanceof $12716e7fca7b0c49$export$10c90e4f7922046c ? (this.v = v, this) : new $12716e7fca7b0c49$export$10c90e4f7922046c(v);
}
function $12716e7fca7b0c49$export$e427f37a30a4de9b(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof $12716e7fca7b0c49$export$10c90e4f7922046c ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function $12716e7fca7b0c49$export$bbd80228419bb833(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: $12716e7fca7b0c49$export$10c90e4f7922046c(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function $12716e7fca7b0c49$export$e3b29a3d6162315f(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof $12716e7fca7b0c49$export$19a8beecd37a4c45 === "function" ? $12716e7fca7b0c49$export$19a8beecd37a4c45(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function $12716e7fca7b0c49$export$4fb47efe1390b86f(cooked, raw) {
    if (Object.defineProperty) Object.defineProperty(cooked, "raw", {
        value: raw
    });
    else cooked.raw = raw;
    return cooked;
}
var $12716e7fca7b0c49$var$__setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var $12716e7fca7b0c49$var$ownKeys = function(o) {
    $12716e7fca7b0c49$var$ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return $12716e7fca7b0c49$var$ownKeys(o);
};
function $12716e7fca7b0c49$export$c21735bcef00d192(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = $12716e7fca7b0c49$var$ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") $12716e7fca7b0c49$export$45d3717a4c69092e(result, mod, k[i]);
    }
    $12716e7fca7b0c49$var$__setModuleDefault(result, mod);
    return result;
}
function $12716e7fca7b0c49$export$da59b14a69baef04(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function $12716e7fca7b0c49$export$d5dcaf168c640c35(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function $12716e7fca7b0c49$export$d40a35129aaff81f(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function $12716e7fca7b0c49$export$81fdc39f203e4e04(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function $12716e7fca7b0c49$export$88ac25d8e944e405(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) env.stack.push({
        async: true
    });
    return value;
}
var $12716e7fca7b0c49$var$_SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function $12716e7fca7b0c49$export$8f076105dc360e92(env) {
    function fail(e) {
        env.error = env.hasError ? new $12716e7fca7b0c49$var$_SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop())try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } else s |= 1;
        } catch (e) {
            fail(e);
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function $12716e7fca7b0c49$export$889dfb5d17574b0b(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
        return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
    return path;
}
var $12716e7fca7b0c49$export$2e2bcd8739ae039 = {
    __extends: $12716e7fca7b0c49$export$a8ba968b8961cb8a,
    __assign: $12716e7fca7b0c49$export$18ce0697a983be9b,
    __rest: $12716e7fca7b0c49$export$3c9a16f847548506,
    __decorate: $12716e7fca7b0c49$export$29e00dfd3077644b,
    __param: $12716e7fca7b0c49$export$d5ad3fd78186038f,
    __esDecorate: $12716e7fca7b0c49$export$3a84e1ae4e97e9b0,
    __runInitializers: $12716e7fca7b0c49$export$d831c04e792af3d,
    __propKey: $12716e7fca7b0c49$export$6a2a36740a146cb8,
    __setFunctionName: $12716e7fca7b0c49$export$d1a06452d3489bc7,
    __metadata: $12716e7fca7b0c49$export$f1db080c865becb9,
    __awaiter: $12716e7fca7b0c49$export$1050f835b63b671e,
    __generator: $12716e7fca7b0c49$export$67ebef60e6f28a6,
    __createBinding: $12716e7fca7b0c49$export$45d3717a4c69092e,
    __exportStar: $12716e7fca7b0c49$export$f33643c0debef087,
    __values: $12716e7fca7b0c49$export$19a8beecd37a4c45,
    __read: $12716e7fca7b0c49$export$8d051b38c9118094,
    __spread: $12716e7fca7b0c49$export$afc72e2116322959,
    __spreadArrays: $12716e7fca7b0c49$export$6388937ca91ccae8,
    __spreadArray: $12716e7fca7b0c49$export$1216008129fb82ed,
    __await: $12716e7fca7b0c49$export$10c90e4f7922046c,
    __asyncGenerator: $12716e7fca7b0c49$export$e427f37a30a4de9b,
    __asyncDelegator: $12716e7fca7b0c49$export$bbd80228419bb833,
    __asyncValues: $12716e7fca7b0c49$export$e3b29a3d6162315f,
    __makeTemplateObject: $12716e7fca7b0c49$export$4fb47efe1390b86f,
    __importStar: $12716e7fca7b0c49$export$c21735bcef00d192,
    __importDefault: $12716e7fca7b0c49$export$da59b14a69baef04,
    __classPrivateFieldGet: $12716e7fca7b0c49$export$d5dcaf168c640c35,
    __classPrivateFieldSet: $12716e7fca7b0c49$export$d40a35129aaff81f,
    __classPrivateFieldIn: $12716e7fca7b0c49$export$81fdc39f203e4e04,
    __addDisposableResource: $12716e7fca7b0c49$export$88ac25d8e944e405,
    __disposeResources: $12716e7fca7b0c49$export$8f076105dc360e92,
    __rewriteRelativeImportExtension: $12716e7fca7b0c49$export$889dfb5d17574b0b
};


const $062cb5dc12115781$export$98d92b1aa79f8cc7 = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};


/**
 * Base error for Supabase Edge Function invocations.
 *
 * @example
 * ```ts
 * import { FunctionsError } from '@supabase/functions-js'
 *
 * throw new FunctionsError('Unexpected error invoking function', 'FunctionsError', {
 *   requestId: 'abc123',
 * })
 * ```
 */ class $b3ebd0ca09ef5ca8$export$738689d52335bb3c extends Error {
    constructor(message, name = 'FunctionsError', context){
        super(message);
        this.name = name;
        this.context = context;
    }
}
class $b3ebd0ca09ef5ca8$export$14f2b6540d498ce extends $b3ebd0ca09ef5ca8$export$738689d52335bb3c {
    constructor(context){
        super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
    }
}
class $b3ebd0ca09ef5ca8$export$d08a45df86040161 extends $b3ebd0ca09ef5ca8$export$738689d52335bb3c {
    constructor(context){
        super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
    }
}
class $b3ebd0ca09ef5ca8$export$761f8c0e0fa4624f extends $b3ebd0ca09ef5ca8$export$738689d52335bb3c {
    constructor(context){
        super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
    }
}
var $b3ebd0ca09ef5ca8$export$9b19f1a5abf91e06;
(function(FunctionRegion) {
    FunctionRegion["Any"] = "any";
    FunctionRegion["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion["ApSouth1"] = "ap-south-1";
    FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion["CaCentral1"] = "ca-central-1";
    FunctionRegion["EuCentral1"] = "eu-central-1";
    FunctionRegion["EuWest1"] = "eu-west-1";
    FunctionRegion["EuWest2"] = "eu-west-2";
    FunctionRegion["EuWest3"] = "eu-west-3";
    FunctionRegion["SaEast1"] = "sa-east-1";
    FunctionRegion["UsEast1"] = "us-east-1";
    FunctionRegion["UsWest1"] = "us-west-1";
    FunctionRegion["UsWest2"] = "us-west-2";
})($b3ebd0ca09ef5ca8$export$9b19f1a5abf91e06 || ($b3ebd0ca09ef5ca8$export$9b19f1a5abf91e06 = {}));


class $8e338ae52f5b464a$export$1d0b400bf8a0fa55 {
    /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'public-anon-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */ constructor(url, { headers: headers = {}, customFetch: customFetch, region: region = (0, $b3ebd0ca09ef5ca8$export$9b19f1a5abf91e06).Any } = {}){
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = (0, $062cb5dc12115781$export$98d92b1aa79f8cc7)(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     * @example
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */ setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */ invoke(functionName_1) {
        return (0, $12716e7fca7b0c49$export$1050f835b63b671e)(this, arguments, void 0, function*(functionName, options = {}) {
            var _a;
            let timeoutId;
            let timeoutController;
            try {
                const { headers: headers, method: method, body: functionArgs, signal: signal, timeout: timeout } = options;
                let _headers = {};
                let { region: region } = options;
                if (!region) region = this.region;
                // Add region as query parameter using URL API
                const url = new URL(`${this.url}/${functionName}`);
                if (region && region !== 'any') {
                    _headers['x-region'] = region;
                    url.searchParams.set('forceFunctionRegion', region);
                }
                let body;
                if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type') || !headers)) {
                    if (typeof Blob !== 'undefined' && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    } else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    } else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) // don't set content-type headers
                    // Request will automatically add the right boundary value
                    body = functionArgs;
                    else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = JSON.stringify(functionArgs);
                    }
                } else // if the Content-Type was supplied, simply set the body
                body = functionArgs;
                // Handle timeout by creating an AbortController
                let effectiveSignal = signal;
                if (timeout) {
                    timeoutController = new AbortController();
                    timeoutId = setTimeout(()=>timeoutController.abort(), timeout);
                    // If user provided their own signal, we need to respect both
                    if (signal) {
                        effectiveSignal = timeoutController.signal;
                        // If the user's signal is aborted, abort our timeout controller too
                        signal.addEventListener('abort', ()=>timeoutController.abort());
                    } else effectiveSignal = timeoutController.signal;
                }
                const response = yield this.fetch(url.toString(), {
                    method: method || 'POST',
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                    body: body,
                    signal: effectiveSignal
                }).catch((fetchError)=>{
                    throw new (0, $b3ebd0ca09ef5ca8$export$14f2b6540d498ce)(fetchError);
                });
                const isRelayError = response.headers.get('x-relay-error');
                if (isRelayError && isRelayError === 'true') throw new (0, $b3ebd0ca09ef5ca8$export$d08a45df86040161)(response);
                if (!response.ok) throw new (0, $b3ebd0ca09ef5ca8$export$761f8c0e0fa4624f)(response);
                let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                let data;
                if (responseType === 'application/json') data = yield response.json();
                else if (responseType === 'application/octet-stream' || responseType === 'application/pdf') data = yield response.blob();
                else if (responseType === 'text/event-stream') data = response;
                else if (responseType === 'multipart/form-data') data = yield response.formData();
                else // default to text
                data = yield response.text();
                return {
                    data: data,
                    error: null,
                    response: response
                };
            } catch (error) {
                return {
                    data: null,
                    error: error,
                    response: error instanceof (0, $b3ebd0ca09ef5ca8$export$761f8c0e0fa4624f) || error instanceof (0, $b3ebd0ca09ef5ca8$export$d08a45df86040161) ? error.context : undefined
                };
            } finally{
                // Clear the timeout if it was set
                if (timeoutId) clearTimeout(timeoutId);
            }
        });
    }
}


//#region src/PostgrestError.ts
/**
* Error format
*
* {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
*/ var $8528e49f2233f2c9$export$445b7e3a323f992f = class extends Error {
    /**
	* @example
	* ```ts
	* import PostgrestError from '@supabase/postgrest-js'
	*
	* throw new PostgrestError({
	*   message: 'Row level security prevented the request',
	*   details: 'RLS denied the insert',
	*   hint: 'Check your policies',
	*   code: 'PGRST301',
	* })
	* ```
	*/ constructor(context){
        super(context.message);
        this.name = "PostgrestError";
        this.details = context.details;
        this.hint = context.hint;
        this.code = context.code;
    }
};
//#endregion
//#region src/PostgrestBuilder.ts
var $8528e49f2233f2c9$export$3106e21688a06353 = class {
    /**
	* Creates a builder configured for a specific PostgREST request.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const builder = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: new Headers({ apikey: 'public-anon-key' }) }
	* )
	* ```
	*/ constructor(builder){
        var _builder$shouldThrowO, _builder$isMaybeSingl;
        this.shouldThrowOnError = false;
        this.method = builder.method;
        this.url = builder.url;
        this.headers = new Headers(builder.headers);
        this.schema = builder.schema;
        this.body = builder.body;
        this.shouldThrowOnError = (_builder$shouldThrowO = builder.shouldThrowOnError) !== null && _builder$shouldThrowO !== void 0 ? _builder$shouldThrowO : false;
        this.signal = builder.signal;
        this.isMaybeSingle = (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0 ? _builder$isMaybeSingl : false;
        if (builder.fetch) this.fetch = builder.fetch;
        else this.fetch = fetch;
    }
    /**
	* If there's an error with the query, throwOnError will reject the promise by
	* throwing the error instead of returning it as part of a successful response.
	*
	* {@link https://github.com/supabase/supabase-js/issues/92}
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* Set an HTTP header for the request.
	*/ setHeader(name, value) {
        this.headers = new Headers(this.headers);
        this.headers.set(name, value);
        return this;
    }
    then(onfulfilled, onrejected) {
        var _this = this;
        if (this.schema === void 0) ;
        else if ([
            "GET",
            "HEAD"
        ].includes(this.method)) this.headers.set("Accept-Profile", this.schema);
        else this.headers.set("Content-Profile", this.schema);
        if (this.method !== "GET" && this.method !== "HEAD") this.headers.set("Content-Type", "application/json");
        const _fetch = this.fetch;
        let res = _fetch(this.url.toString(), {
            method: this.method,
            headers: this.headers,
            body: JSON.stringify(this.body),
            signal: this.signal
        }).then(async (res$1)=>{
            let error = null;
            let data = null;
            let count = null;
            let status = res$1.status;
            let statusText = res$1.statusText;
            if (res$1.ok) {
                var _this$headers$get2, _res$headers$get;
                if (_this.method !== "HEAD") {
                    var _this$headers$get;
                    const body = await res$1.text();
                    if (body === "") ;
                    else if (_this.headers.get("Accept") === "text/csv") data = body;
                    else if (_this.headers.get("Accept") && ((_this$headers$get = _this.headers.get("Accept")) === null || _this$headers$get === void 0 ? void 0 : _this$headers$get.includes("application/vnd.pgrst.plan+text"))) data = body;
                    else data = JSON.parse(body);
                }
                const countHeader = (_this$headers$get2 = _this.headers.get("Prefer")) === null || _this$headers$get2 === void 0 ? void 0 : _this$headers$get2.match(/count=(exact|planned|estimated)/);
                const contentRange = (_res$headers$get = res$1.headers.get("content-range")) === null || _res$headers$get === void 0 ? void 0 : _res$headers$get.split("/");
                if (countHeader && contentRange && contentRange.length > 1) count = parseInt(contentRange[1]);
                if (_this.isMaybeSingle && _this.method === "GET" && Array.isArray(data)) {
                    if (data.length > 1) {
                        error = {
                            code: "PGRST116",
                            details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
                            hint: null,
                            message: "JSON object requested, multiple (or no) rows returned"
                        };
                        data = null;
                        count = null;
                        status = 406;
                        statusText = "Not Acceptable";
                    } else if (data.length === 1) data = data[0];
                    else data = null;
                }
            } else {
                var _error$details;
                const body = await res$1.text();
                try {
                    error = JSON.parse(body);
                    if (Array.isArray(error) && res$1.status === 404) {
                        data = [];
                        error = null;
                        status = 200;
                        statusText = "OK";
                    }
                } catch (_unused) {
                    if (res$1.status === 404 && body === "") {
                        status = 204;
                        statusText = "No Content";
                    } else error = {
                        message: body
                    };
                }
                if (error && _this.isMaybeSingle && (error === null || error === void 0 || (_error$details = error.details) === null || _error$details === void 0 ? void 0 : _error$details.includes("0 rows"))) {
                    error = null;
                    status = 200;
                    statusText = "OK";
                }
                if (error && _this.shouldThrowOnError) throw new $8528e49f2233f2c9$export$445b7e3a323f992f(error);
            }
            return {
                error: error,
                data: data,
                count: count,
                status: status,
                statusText: statusText
            };
        });
        if (!this.shouldThrowOnError) res = res.catch((fetchError)=>{
            var _fetchError$name2;
            let errorDetails = "";
            const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
            if (cause) {
                var _cause$message, _cause$code, _fetchError$name, _cause$name;
                const causeMessage = (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _cause$message !== void 0 ? _cause$message : "";
                const causeCode = (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _cause$code !== void 0 ? _cause$code : "";
                errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
                errorDetails += `\n\nCaused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`;
                if (causeCode) errorDetails += ` (${causeCode})`;
                if (cause === null || cause === void 0 ? void 0 : cause.stack) errorDetails += `\n${cause.stack}`;
            } else {
                var _fetchError$stack;
                errorDetails = (_fetchError$stack = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _fetchError$stack !== void 0 ? _fetchError$stack : "";
            }
            return {
                error: {
                    message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
                    details: errorDetails,
                    hint: "",
                    code: ""
                },
                data: null,
                count: null,
                status: 0,
                statusText: ""
            };
        });
        return res.then(onfulfilled, onrejected);
    }
    /**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/ returns() {
        /* istanbul ignore next */ return this;
    }
    /**
	* Override the type of the returned `data` field in the response.
	*
	* @typeParam NewResult - The new type to cast the response data to
	* @typeParam Options - Optional type configuration (defaults to { merge: true })
	* @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
	* @example
	* ```typescript
	* // Merge with existing types (default behavior)
	* const query = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ custom_field: string }>()
	*
	* // Replace existing types completely
	* const replaceQuery = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ id: number; name: string }, { merge: false }>()
	* ```
	* @returns A PostgrestBuilder instance with the new type
	*/ overrideTypes() {
        return this;
    }
};
//#endregion
//#region src/PostgrestTransformBuilder.ts
var $8528e49f2233f2c9$export$7b4361bb87e3030c = class extends $8528e49f2233f2c9$export$3106e21688a06353 {
    /**
	* Perform a SELECT on the query result.
	*
	* By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
	* return modified rows. By calling this method, modified rows are returned in
	* `data`.
	*
	* @param columns - The columns to retrieve, separated by commas
	*/ select(columns) {
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c)=>{
            if (/\s/.test(c) && !quoted) return "";
            if (c === "\"") quoted = !quoted;
            return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        this.headers.append("Prefer", "return=representation");
        return this;
    }
    /**
	* Order the query result by `column`.
	*
	* You can call this method multiple times to order by multiple columns.
	*
	* You can order referenced tables, but it only affects the ordering of the
	* parent table if you use `!inner` in the query.
	*
	* @param column - The column to order by
	* @param options - Named parameters
	* @param options.ascending - If `true`, the result will be in ascending order
	* @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
	* `null`s appear last.
	* @param options.referencedTable - Set this to order a referenced table by
	* its columns
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ order(column, { ascending: ascending = true, nullsFirst: nullsFirst, foreignTable: foreignTable, referencedTable: referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.order` : "order";
        const existingOrder = this.url.searchParams.get(key);
        this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
        return this;
    }
    /**
	* Limit the query result by `count`.
	*
	* @param count - The maximum number of rows to return
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ limit(count, { foreignTable: foreignTable, referencedTable: referencedTable = foreignTable } = {}) {
        const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(key, `${count}`);
        return this;
    }
    /**
	* Limit the query result by starting at an offset `from` and ending at the offset `to`.
	* Only records within this range are returned.
	* This respects the query order and if there is no order clause the range could behave unexpectedly.
	* The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
	* and fourth rows of the query.
	*
	* @param from - The starting index from which to limit the result
	* @param to - The last index to which to limit the result
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/ range(from, to, { foreignTable: foreignTable, referencedTable: referencedTable = foreignTable } = {}) {
        const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
        const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
        this.url.searchParams.set(keyOffset, `${from}`);
        this.url.searchParams.set(keyLimit, `${to - from + 1}`);
        return this;
    }
    /**
	* Set the AbortSignal for the fetch request.
	*
	* @param signal - The AbortSignal to use for the fetch request
	*/ abortSignal(signal) {
        this.signal = signal;
        return this;
    }
    /**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be one row (e.g. using `.limit(1)`), otherwise this
	* returns an error.
	*/ single() {
        this.headers.set("Accept", "application/vnd.pgrst.object+json");
        return this;
    }
    /**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
	* this returns an error.
	*/ maybeSingle() {
        if (this.method === "GET") this.headers.set("Accept", "application/json");
        else this.headers.set("Accept", "application/vnd.pgrst.object+json");
        this.isMaybeSingle = true;
        return this;
    }
    /**
	* Return `data` as a string in CSV format.
	*/ csv() {
        this.headers.set("Accept", "text/csv");
        return this;
    }
    /**
	* Return `data` as an object in [GeoJSON](https://geojson.org) format.
	*/ geojson() {
        this.headers.set("Accept", "application/geo+json");
        return this;
    }
    /**
	* Return `data` as the EXPLAIN plan for the query.
	*
	* You need to enable the
	* [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
	* setting before using this method.
	*
	* @param options - Named parameters
	*
	* @param options.analyze - If `true`, the query will be executed and the
	* actual run time will be returned
	*
	* @param options.verbose - If `true`, the query identifier will be returned
	* and `data` will include the output columns of the query
	*
	* @param options.settings - If `true`, include information on configuration
	* parameters that affect query planning
	*
	* @param options.buffers - If `true`, include information on buffer usage
	*
	* @param options.wal - If `true`, include information on WAL record generation
	*
	* @param options.format - The format of the output, can be `"text"` (default)
	* or `"json"`
	*/ explain({ analyze: analyze = false, verbose: verbose = false, settings: settings = false, buffers: buffers = false, wal: wal = false, format: format = "text" } = {}) {
        var _this$headers$get;
        const options = [
            analyze ? "analyze" : null,
            verbose ? "verbose" : null,
            settings ? "settings" : null,
            buffers ? "buffers" : null,
            wal ? "wal" : null
        ].filter(Boolean).join("|");
        const forMediatype = (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0 ? _this$headers$get : "application/json";
        this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
        if (format === "json") return this;
        else return this;
    }
    /**
	* Rollback the query.
	*
	* `data` will still be returned, but the query is not committed.
	*/ rollback() {
        this.headers.append("Prefer", "tx=rollback");
        return this;
    }
    /**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/ returns() {
        return this;
    }
    /**
	* Set the maximum number of rows that can be affected by the query.
	* Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
	*
	* @param value - The maximum number of rows that can be affected
	*/ maxAffected(value) {
        this.headers.append("Prefer", "handling=strict");
        this.headers.append("Prefer", `max-affected=${value}`);
        return this;
    }
};
//#endregion
//#region src/PostgrestFilterBuilder.ts
const $8528e49f2233f2c9$var$PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]");
var $8528e49f2233f2c9$export$3158317c13bdc93a = class extends $8528e49f2233f2c9$export$7b4361bb87e3030c {
    /**
	* Match only rows where `column` is equal to `value`.
	*
	* To check if the value of `column` is NULL, you should use `.is()` instead.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ eq(column, value) {
        this.url.searchParams.append(column, `eq.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is not equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ neq(column, value) {
        this.url.searchParams.append(column, `neq.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is greater than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ gt(column, value) {
        this.url.searchParams.append(column, `gt.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is greater than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ gte(column, value) {
        this.url.searchParams.append(column, `gte.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is less than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ lt(column, value) {
        this.url.searchParams.append(column, `lt.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is less than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ lte(column, value) {
        this.url.searchParams.append(column, `lte.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` matches `pattern` case-sensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/ like(column, pattern) {
        this.url.searchParams.append(column, `like.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches all of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ likeAllOf(column, patterns) {
        this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches any of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ likeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches `pattern` case-insensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/ ilike(column, pattern) {
        this.url.searchParams.append(column, `ilike.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches all of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ ilikeAllOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches any of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/ ilikeAnyOf(column, patterns) {
        this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
        return this;
    }
    /**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-sensitively (using the `~` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/ regexMatch(column, pattern) {
        this.url.searchParams.append(column, `match.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-insensitively (using the `~*` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/ regexIMatch(column, pattern) {
        this.url.searchParams.append(column, `imatch.${pattern}`);
        return this;
    }
    /**
	* Match only rows where `column` IS `value`.
	*
	* For non-boolean columns, this is only relevant for checking if the value of
	* `column` is NULL by setting `value` to `null`.
	*
	* For boolean columns, you can also set `value` to `true` or `false` and it
	* will behave the same way as `.eq()`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ is(column, value) {
        this.url.searchParams.append(column, `is.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` IS DISTINCT FROM `value`.
	*
	* Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
	* are considered equal (not distinct), and comparing `NULL` with any non-NULL
	* value returns true (distinct).
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/ isDistinct(column, value) {
        this.url.searchParams.append(column, `isdistinct.${value}`);
        return this;
    }
    /**
	* Match only rows where `column` is included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/ in(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s)=>{
            if (typeof s === "string" && $8528e49f2233f2c9$var$PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
            else return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `in.(${cleanedValues})`);
        return this;
    }
    /**
	* Match only rows where `column` is NOT included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/ notIn(column, values) {
        const cleanedValues = Array.from(new Set(values)).map((s)=>{
            if (typeof s === "string" && $8528e49f2233f2c9$var$PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
            else return `${s}`;
        }).join(",");
        this.url.searchParams.append(column, `not.in.(${cleanedValues})`);
        return this;
    }
    /**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* `column` contains every element appearing in `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/ contains(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `cs.${value}`);
        else if (Array.isArray(value)) this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
        else this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
        return this;
    }
    /**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* every element appearing in `column` is contained by `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/ containedBy(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `cd.${value}`);
        else if (Array.isArray(value)) this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
        else this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is greater than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeGt(column, range) {
        this.url.searchParams.append(column, `sr.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or greater than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeGte(column, range) {
        this.url.searchParams.append(column, `nxl.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is less than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeLt(column, range) {
        this.url.searchParams.append(column, `sl.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or less than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeLte(column, range) {
        this.url.searchParams.append(column, `nxr.${range}`);
        return this;
    }
    /**
	* Only relevant for range columns. Match only rows where `column` is
	* mutually exclusive to `range` and there can be no element between the two
	* ranges.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/ rangeAdjacent(column, range) {
        this.url.searchParams.append(column, `adj.${range}`);
        return this;
    }
    /**
	* Only relevant for array and range columns. Match only rows where
	* `column` and `value` have an element in common.
	*
	* @param column - The array or range column to filter on
	* @param value - The array or range value to filter with
	*/ overlaps(column, value) {
        if (typeof value === "string") this.url.searchParams.append(column, `ov.${value}`);
        else this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
        return this;
    }
    /**
	* Only relevant for text and tsvector columns. Match only rows where
	* `column` matches the query string in `query`.
	*
	* @param column - The text or tsvector column to filter on
	* @param query - The query text to match with
	* @param options - Named parameters
	* @param options.config - The text search configuration to use
	* @param options.type - Change how the `query` text is interpreted
	*/ textSearch(column, query, { config: config, type: type } = {}) {
        let typePart = "";
        if (type === "plain") typePart = "pl";
        else if (type === "phrase") typePart = "ph";
        else if (type === "websearch") typePart = "w";
        const configPart = config === void 0 ? "" : `(${config})`;
        this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
        return this;
    }
    /**
	* Match only rows where each column in `query` keys is equal to its
	* associated value. Shorthand for multiple `.eq()`s.
	*
	* @param query - The object to filter with, with column names as keys mapped
	* to their filter values
	*/ match(query) {
        Object.entries(query).forEach(([column, value])=>{
            this.url.searchParams.append(column, `eq.${value}`);
        });
        return this;
    }
    /**
	* Match only rows which doesn't satisfy the filter.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to be negated to filter with, following
	* PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/ not(column, operator, value) {
        this.url.searchParams.append(column, `not.${operator}.${value}`);
        return this;
    }
    /**
	* Match only rows which satisfy at least one of the filters.
	*
	* Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure it's properly sanitized.
	*
	* It's currently not possible to do an `.or()` filter across multiple tables.
	*
	* @param filters - The filters to use, following PostgREST syntax
	* @param options - Named parameters
	* @param options.referencedTable - Set this to filter on referenced tables
	* instead of the parent table
	* @param options.foreignTable - Deprecated, use `referencedTable` instead
	*/ or(filters, { foreignTable: foreignTable, referencedTable: referencedTable = foreignTable } = {}) {
        const key = referencedTable ? `${referencedTable}.or` : "or";
        this.url.searchParams.append(key, `(${filters})`);
        return this;
    }
    /**
	* Match only rows which satisfy the filter. This is an escape hatch - you
	* should use the specific filter methods wherever possible.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to filter with, following PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/ filter(column, operator, value) {
        this.url.searchParams.append(column, `${operator}.${value}`);
        return this;
    }
};
//#endregion
//#region src/PostgrestQueryBuilder.ts
var $8528e49f2233f2c9$export$a81993b50ca081ad = class {
    /**
	* Creates a query builder scoped to a Postgres table or view.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const query = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: { apikey: 'public-anon-key' } }
	* )
	* ```
	*/ constructor(url, { headers: headers = {}, schema: schema, fetch: fetch$1 }){
        this.url = url;
        this.headers = new Headers(headers);
        this.schema = schema;
        this.fetch = fetch$1;
    }
    /**
	* Perform a SELECT query on the table or view.
	*
	* @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
	*
	* @param options - Named parameters
	*
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	*
	* @param options.count - Count algorithm to use to count rows in the table or view.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ select(columns, options) {
        const { head: head = false, count: count } = options !== null && options !== void 0 ? options : {};
        const method = head ? "HEAD" : "GET";
        let quoted = false;
        const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c)=>{
            if (/\s/.test(c) && !quoted) return "";
            if (c === "\"") quoted = !quoted;
            return c;
        }).join("");
        this.url.searchParams.set("select", cleanedColumns);
        if (count) this.headers.append("Prefer", `count=${count}`);
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: this.fetch
        });
    }
    /**
	* Perform an INSERT into the table or view.
	*
	* By default, inserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to insert. Pass an object to insert a single row
	* or an array to insert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count inserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. Only applies for bulk
	* inserts.
	*/ insert(values, { count: count, defaultToNull: defaultToNull = true } = {}) {
        var _this$fetch;
        const method = "POST";
        if (count) this.headers.append("Prefer", `count=${count}`);
        if (!defaultToNull) this.headers.append("Prefer", `missing=default`);
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x)=>acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [
                    ...new Set(columns)
                ].map((column)=>`"${column}"`);
                this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
        }
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch
        });
    }
    /**
	* Perform an UPSERT on the table or view. Depending on the column(s) passed
	* to `onConflict`, `.upsert()` allows you to perform the equivalent of
	* `.insert()` if a row with the corresponding `onConflict` columns doesn't
	* exist, or if it does exist, perform an alternative action depending on
	* `ignoreDuplicates`.
	*
	* By default, upserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to upsert with. Pass an object to upsert a
	* single row or an array to upsert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
	* duplicate rows are determined. Two rows are duplicates if all the
	* `onConflict` columns are equal.
	*
	* @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
	* `false`, duplicate rows are merged with existing rows.
	*
	* @param options.count - Count algorithm to use to count upserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. This only applies when
	* inserting new rows, not when merging with existing rows under
	* `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
	*
	* @example Upsert a single row using a unique key
	* ```ts
	* // Upserting a single row, overwriting based on the 'username' unique column
	* const { data, error } = await supabase
	*   .from('users')
	*   .upsert({ username: 'supabot' }, { onConflict: 'username' })
	*
	* // Example response:
	* // {
	* //   data: [
	* //     { id: 4, message: 'bar', username: 'supabot' }
	* //   ],
	* //   error: null
	* // }
	* ```
	*
	* @example Upsert with conflict resolution and exact row counting
	* ```ts
	* // Upserting and returning exact count
	* const { data, error, count } = await supabase
	*   .from('users')
	*   .upsert(
	*     {
	*       id: 3,
	*       message: 'foo',
	*       username: 'supabot'
	*     },
	*     {
	*       onConflict: 'username',
	*       count: 'exact'
	*     }
	*   )
	*
	* // Example response:
	* // {
	* //   data: [
	* //     {
	* //       id: 42,
	* //       handle: "saoirse",
	* //       display_name: "Saoirse"
	* //     }
	* //   ],
	* //   count: 1,
	* //   error: null
	* // }
	* ```
	*/ upsert(values, { onConflict: onConflict, ignoreDuplicates: ignoreDuplicates = false, count: count, defaultToNull: defaultToNull = true } = {}) {
        var _this$fetch2;
        const method = "POST";
        this.headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
        if (onConflict !== void 0) this.url.searchParams.set("on_conflict", onConflict);
        if (count) this.headers.append("Prefer", `count=${count}`);
        if (!defaultToNull) this.headers.append("Prefer", "missing=default");
        if (Array.isArray(values)) {
            const columns = values.reduce((acc, x)=>acc.concat(Object.keys(x)), []);
            if (columns.length > 0) {
                const uniqueColumns = [
                    ...new Set(columns)
                ].map((column)=>`"${column}"`);
                this.url.searchParams.set("columns", uniqueColumns.join(","));
            }
        }
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch
        });
    }
    /**
	* Perform an UPDATE on the table or view.
	*
	* By default, updated rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param values - The values to update with
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count updated rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ update(values, { count: count } = {}) {
        var _this$fetch3;
        const method = "PATCH";
        if (count) this.headers.append("Prefer", `count=${count}`);
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            body: values,
            fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch
        });
    }
    /**
	* Perform a DELETE on the table or view.
	*
	* By default, deleted rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count deleted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ delete({ count: count } = {}) {
        var _this$fetch4;
        const method = "DELETE";
        if (count) this.headers.append("Prefer", `count=${count}`);
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: this.url,
            headers: this.headers,
            schema: this.schema,
            fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch
        });
    }
};
//#endregion
//#region src/PostgrestClient.ts
/**
* PostgREST client.
*
* @typeParam Database - Types for the schema from the [type
* generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
*
* @typeParam SchemaName - Postgres schema to switch to. Must be a string
* literal, the same one passed to the constructor. If the schema is not
* `"public"`, this must be supplied manually.
*/ var $8528e49f2233f2c9$export$796f32e2ee984aaa = class PostgrestClient {
    /**
	* Creates a PostgREST client.
	*
	* @param url - URL of the PostgREST endpoint
	* @param options - Named parameters
	* @param options.headers - Custom headers
	* @param options.schema - Postgres schema to switch to
	* @param options.fetch - Custom fetch
	* @example
	* ```ts
	* import PostgrestClient from '@supabase/postgrest-js'
	*
	* const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
	*   headers: { apikey: 'public-anon-key' },
	*   schema: 'public',
	* })
	* ```
	*/ constructor(url, { headers: headers = {}, schema: schema, fetch: fetch$1 } = {}){
        this.url = url;
        this.headers = new Headers(headers);
        this.schemaName = schema;
        this.fetch = fetch$1;
    }
    /**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/ from(relation) {
        if (!relation || typeof relation !== "string" || relation.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
        return new $8528e49f2233f2c9$export$a81993b50ca081ad(new URL(`${this.url}/${relation}`), {
            headers: new Headers(this.headers),
            schema: this.schemaName,
            fetch: this.fetch
        });
    }
    /**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/ schema(schema) {
        return new PostgrestClient(this.url, {
            headers: this.headers,
            schema: schema,
            fetch: this.fetch
        });
    }
    /**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @example
	* ```ts
	* // For cross-schema functions where type inference fails, use overrideTypes:
	* const { data } = await supabase
	*   .schema('schema_b')
	*   .rpc('function_a', {})
	*   .overrideTypes<{ id: string; user_id: string }[]>()
	* ```
	*/ rpc(fn, args = {}, { head: head = false, get: get = false, count: count } = {}) {
        var _this$fetch;
        let method;
        const url = new URL(`${this.url}/rpc/${fn}`);
        let body;
        if (head || get) {
            method = head ? "HEAD" : "GET";
            Object.entries(args).filter(([_, value])=>value !== void 0).map(([name, value])=>[
                    name,
                    Array.isArray(value) ? `{${value.join(",")}}` : `${value}`
                ]).forEach(([name, value])=>{
                url.searchParams.append(name, value);
            });
        } else {
            method = "POST";
            body = args;
        }
        const headers = new Headers(this.headers);
        if (count) headers.set("Prefer", `count=${count}`);
        return new $8528e49f2233f2c9$export$3158317c13bdc93a({
            method: method,
            url: url,
            headers: headers,
            schema: this.schemaName,
            body: body,
            fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch
        });
    }
};
//#endregion
//#region src/index.ts
var $8528e49f2233f2c9$export$2e2bcd8739ae039 = {
    PostgrestClient: $8528e49f2233f2c9$export$796f32e2ee984aaa,
    PostgrestQueryBuilder: $8528e49f2233f2c9$export$a81993b50ca081ad,
    PostgrestFilterBuilder: $8528e49f2233f2c9$export$3158317c13bdc93a,
    PostgrestTransformBuilder: $8528e49f2233f2c9$export$7b4361bb87e3030c,
    PostgrestBuilder: $8528e49f2233f2c9$export$3106e21688a06353,
    PostgrestError: $8528e49f2233f2c9$export$445b7e3a323f992f
};


/**
 * Utilities for creating WebSocket instances across runtimes.
 */ class $bd9835a6595fa653$export$67be75336dea7fb5 {
    /**
     * Static-only utility – prevent instantiation.
     */ constructor(){}
    static detectEnvironment() {
        var _a;
        if (typeof WebSocket !== 'undefined') return {
            type: 'native',
            constructor: WebSocket
        };
        if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocket !== 'undefined') return {
            type: 'native',
            constructor: globalThis.WebSocket
        };
        if (typeof $parcel$global !== 'undefined' && typeof $parcel$global.WebSocket !== 'undefined') return {
            type: 'native',
            constructor: $parcel$global.WebSocket
        };
        if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocketPair !== 'undefined' && typeof globalThis.WebSocket === 'undefined') return {
            type: 'cloudflare',
            error: 'Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.',
            workaround: 'Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.'
        };
        if (typeof globalThis !== 'undefined' && globalThis.EdgeRuntime || typeof navigator !== 'undefined' && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes('Vercel-Edge'))) return {
            type: 'unsupported',
            error: 'Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.',
            workaround: 'Use serverless functions or a different deployment target for WebSocket functionality.'
        };
        return {
            type: 'unsupported',
            error: 'Unknown JavaScript runtime without WebSocket support.',
            workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."
        };
    }
    /**
     * Returns the best available WebSocket constructor for the current runtime.
     *
     * @example
     * ```ts
     * const WS = WebSocketFactory.getWebSocketConstructor()
     * const socket = new WS('wss://realtime.supabase.co/socket')
     * ```
     */ static getWebSocketConstructor() {
        const env = this.detectEnvironment();
        if (env.constructor) return env.constructor;
        let errorMessage = env.error || 'WebSocket not supported in this environment.';
        if (env.workaround) errorMessage += `\n\nSuggested solution: ${env.workaround}`;
        throw new Error(errorMessage);
    }
    /**
     * Creates a WebSocket using the detected constructor.
     *
     * @example
     * ```ts
     * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
     * ```
     */ static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor();
        return new WS(url, protocols);
    }
    /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @example
     * ```ts
     * if (!WebSocketFactory.isWebSocketSupported()) {
     *   console.warn('Falling back to long polling')
     * }
     * ```
     */ static isWebSocketSupported() {
        try {
            const env = this.detectEnvironment();
            return env.type === 'native' || env.type === 'ws';
        } catch (_a) {
            return false;
        }
    }
}
var $bd9835a6595fa653$export$2e2bcd8739ae039 = $bd9835a6595fa653$export$67be75336dea7fb5;


// Generated automatically during releases by scripts/update-version-files.ts
// This file provides runtime access to the package version for:
// - HTTP request headers (e.g., X-Client-Info header for API requests)
// - Debugging and support (identifying which version is running)
// - Telemetry and logging (version reporting in errors/analytics)
// - Ensuring build artifacts match the published package version
const $6d3b71d80bd2ac44$export$83d89fbfd8236492 = '2.89.0';


const $14c34fa438c93719$export$363ebe89e6e7aeef = `realtime-js/${(0, $6d3b71d80bd2ac44$export$83d89fbfd8236492)}`;
const $14c34fa438c93719$export$b8f6d7e635d6c56b = '1.0.0';
const $14c34fa438c93719$export$3f251ec2d5d5cd3a = '2.0.0';
const $14c34fa438c93719$export$90c89f9664aa9117 = $14c34fa438c93719$export$b8f6d7e635d6c56b;
const $14c34fa438c93719$export$a4ad2735b021c132 = (0, $6d3b71d80bd2ac44$export$83d89fbfd8236492);
const $14c34fa438c93719$export$7bd623b29ec8e1eb = 10000;
const $14c34fa438c93719$export$5e80cf62e56a877b = 1000;
const $14c34fa438c93719$export$f227fe8351a81f4a = 100;
var $14c34fa438c93719$export$a6d0320a1563d49e;
(function(SOCKET_STATES) {
    SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
    SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
    SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
    SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
})($14c34fa438c93719$export$a6d0320a1563d49e || ($14c34fa438c93719$export$a6d0320a1563d49e = {}));
var $14c34fa438c93719$export$b83816118db74fe7;
(function(CHANNEL_STATES) {
    CHANNEL_STATES["closed"] = "closed";
    CHANNEL_STATES["errored"] = "errored";
    CHANNEL_STATES["joined"] = "joined";
    CHANNEL_STATES["joining"] = "joining";
    CHANNEL_STATES["leaving"] = "leaving";
})($14c34fa438c93719$export$b83816118db74fe7 || ($14c34fa438c93719$export$b83816118db74fe7 = {}));
var $14c34fa438c93719$export$8db7548e65d6ea55;
(function(CHANNEL_EVENTS) {
    CHANNEL_EVENTS["close"] = "phx_close";
    CHANNEL_EVENTS["error"] = "phx_error";
    CHANNEL_EVENTS["join"] = "phx_join";
    CHANNEL_EVENTS["reply"] = "phx_reply";
    CHANNEL_EVENTS["leave"] = "phx_leave";
    CHANNEL_EVENTS["access_token"] = "access_token";
})($14c34fa438c93719$export$8db7548e65d6ea55 || ($14c34fa438c93719$export$8db7548e65d6ea55 = {}));
var $14c34fa438c93719$export$b2688bfb999f5751;
(function(TRANSPORTS) {
    TRANSPORTS["websocket"] = "websocket";
})($14c34fa438c93719$export$b2688bfb999f5751 || ($14c34fa438c93719$export$b2688bfb999f5751 = {}));
var $14c34fa438c93719$export$deda39003d27273;
(function(CONNECTION_STATE) {
    CONNECTION_STATE["Connecting"] = "connecting";
    CONNECTION_STATE["Open"] = "open";
    CONNECTION_STATE["Closing"] = "closing";
    CONNECTION_STATE["Closed"] = "closed";
})($14c34fa438c93719$export$deda39003d27273 || ($14c34fa438c93719$export$deda39003d27273 = {}));


class $5eea4ff75501b31d$export$2e2bcd8739ae039 {
    constructor(allowedMetadataKeys){
        this.HEADER_LENGTH = 1;
        this.USER_BROADCAST_PUSH_META_LENGTH = 6;
        this.KINDS = {
            userBroadcastPush: 3,
            userBroadcast: 4
        };
        this.BINARY_ENCODING = 0;
        this.JSON_ENCODING = 1;
        this.BROADCAST_EVENT = 'broadcast';
        this.allowedMetadataKeys = [];
        this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
    }
    encode(msg, callback) {
        if (msg.event === this.BROADCAST_EVENT && !(msg.payload instanceof ArrayBuffer) && typeof msg.payload.event === 'string') return callback(this._binaryEncodeUserBroadcastPush(msg));
        let payload = [
            msg.join_ref,
            msg.ref,
            msg.topic,
            msg.event,
            msg.payload
        ];
        return callback(JSON.stringify(payload));
    }
    _binaryEncodeUserBroadcastPush(message) {
        var _a;
        if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) return this._encodeBinaryUserBroadcastPush(message);
        else return this._encodeJsonUserBroadcastPush(message);
    }
    _encodeBinaryUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
        return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
    }
    _encodeJsonUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
        const encoder = new TextEncoder();
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
        return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
    }
    _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
        var _a, _b;
        const topic = message.topic;
        const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : '';
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : '';
        const userEvent = message.payload.event;
        // Filter metadata based on allowed keys
        const rest = this.allowedMetadataKeys ? this._pick(message.payload, this.allowedMetadataKeys) : {};
        const metadata = Object.keys(rest).length === 0 ? '' : JSON.stringify(rest);
        // Validate lengths don't exceed uint8 max value (255)
        if (joinRef.length > 255) throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
        if (ref.length > 255) throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
        if (topic.length > 255) throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
        if (userEvent.length > 255) throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
        if (metadata.length > 255) throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH + joinRef.length + ref.length + topic.length + userEvent.length + metadata.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush); // kind
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, metadata.length);
        view.setUint8(offset++, encodingType);
        Array.from(joinRef, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(metadata, (char)=>view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(encodedPayload), header.byteLength);
        return combined.buffer;
    }
    decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
            let result = this._binaryDecode(rawPayload);
            return callback(result);
        }
        if (typeof rawPayload === 'string') {
            const jsonPayload = JSON.parse(rawPayload);
            const [join_ref, ref, topic, event, payload] = jsonPayload;
            return callback({
                join_ref: join_ref,
                ref: ref,
                topic: topic,
                event: event,
                payload: payload
            });
        }
        return callback({});
    }
    _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const kind = view.getUint8(0);
        const decoder = new TextDecoder();
        switch(kind){
            case this.KINDS.userBroadcast:
                return this._decodeUserBroadcast(buffer, view, decoder);
        }
    }
    _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const userEventSize = view.getUint8(2);
        const metadataSize = view.getUint8(3);
        const payloadEncoding = view.getUint8(4);
        let offset = this.HEADER_LENGTH + 4;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
        offset = offset + userEventSize;
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
        offset = offset + metadataSize;
        const payload = buffer.slice(offset, buffer.byteLength);
        const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
        const data = {
            type: this.BROADCAST_EVENT,
            event: userEvent,
            payload: parsedPayload
        };
        // Metadata is optional and always JSON encoded
        if (metadataSize > 0) data['meta'] = JSON.parse(metadata);
        return {
            join_ref: null,
            ref: null,
            topic: topic,
            event: this.BROADCAST_EVENT,
            payload: data
        };
    }
    _isArrayBuffer(buffer) {
        var _a;
        return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ArrayBuffer';
    }
    _pick(obj, keys) {
        if (!obj || typeof obj !== 'object') return {};
        return Object.fromEntries(Object.entries(obj).filter(([key])=>keys.includes(key)));
    }
}


/**
 * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
 *
 * @example
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 */ class $1eb83973107d60cf$export$2e2bcd8739ae039 {
    constructor(callback, timerCalc){
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = undefined;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
    }
    reset() {
        this.tries = 0;
        clearTimeout(this.timer);
        this.timer = undefined;
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(()=>{
            this.tries = this.tries + 1;
            this.callback();
        }, this.timerCalc(this.tries + 1));
    }
}


/**
 * Helpers to convert the change Payload into native JS types.
 */ // Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
// 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
var $561398f2f029e0d0$export$4d213a7d364021dc;
(function(PostgresTypes) {
    PostgresTypes["abstime"] = "abstime";
    PostgresTypes["bool"] = "bool";
    PostgresTypes["date"] = "date";
    PostgresTypes["daterange"] = "daterange";
    PostgresTypes["float4"] = "float4";
    PostgresTypes["float8"] = "float8";
    PostgresTypes["int2"] = "int2";
    PostgresTypes["int4"] = "int4";
    PostgresTypes["int4range"] = "int4range";
    PostgresTypes["int8"] = "int8";
    PostgresTypes["int8range"] = "int8range";
    PostgresTypes["json"] = "json";
    PostgresTypes["jsonb"] = "jsonb";
    PostgresTypes["money"] = "money";
    PostgresTypes["numeric"] = "numeric";
    PostgresTypes["oid"] = "oid";
    PostgresTypes["reltime"] = "reltime";
    PostgresTypes["text"] = "text";
    PostgresTypes["time"] = "time";
    PostgresTypes["timestamp"] = "timestamp";
    PostgresTypes["timestamptz"] = "timestamptz";
    PostgresTypes["timetz"] = "timetz";
    PostgresTypes["tsrange"] = "tsrange";
    PostgresTypes["tstzrange"] = "tstzrange";
})($561398f2f029e0d0$export$4d213a7d364021dc || ($561398f2f029e0d0$export$4d213a7d364021dc = {}));
const $561398f2f029e0d0$export$20ce708a1f594c5e = (columns, record, options = {})=>{
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    if (!record) return {};
    return Object.keys(record).reduce((acc, rec_key)=>{
        acc[rec_key] = $561398f2f029e0d0$export$c054edfec1afa88d(rec_key, columns, record, skipTypes);
        return acc;
    }, {});
};
const $561398f2f029e0d0$export$c054edfec1afa88d = (columnName, columns, record, skipTypes)=>{
    const column = columns.find((x)=>x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) return $561398f2f029e0d0$export$3df02a362b86a91(colType, value);
    return $561398f2f029e0d0$var$noop(value);
};
const $561398f2f029e0d0$export$3df02a362b86a91 = (type, value)=>{
    // if data type is an array
    if (type.charAt(0) === '_') {
        const dataType = type.slice(1, type.length);
        return $561398f2f029e0d0$export$45b10814cc054894(value, dataType);
    }
    // If not null, convert to correct type.
    switch(type){
        case $561398f2f029e0d0$export$4d213a7d364021dc.bool:
            return $561398f2f029e0d0$export$3c2e6d1b7583eee6(value);
        case $561398f2f029e0d0$export$4d213a7d364021dc.float4:
        case $561398f2f029e0d0$export$4d213a7d364021dc.float8:
        case $561398f2f029e0d0$export$4d213a7d364021dc.int2:
        case $561398f2f029e0d0$export$4d213a7d364021dc.int4:
        case $561398f2f029e0d0$export$4d213a7d364021dc.int8:
        case $561398f2f029e0d0$export$4d213a7d364021dc.numeric:
        case $561398f2f029e0d0$export$4d213a7d364021dc.oid:
            return $561398f2f029e0d0$export$a0a81dc3380ce7d3(value);
        case $561398f2f029e0d0$export$4d213a7d364021dc.json:
        case $561398f2f029e0d0$export$4d213a7d364021dc.jsonb:
            return $561398f2f029e0d0$export$d5b7a8bf56ee1fe2(value);
        case $561398f2f029e0d0$export$4d213a7d364021dc.timestamp:
            return $561398f2f029e0d0$export$eccf8c5d91d19e3a(value); // Format to be consistent with PostgREST
        case $561398f2f029e0d0$export$4d213a7d364021dc.abstime:
        case $561398f2f029e0d0$export$4d213a7d364021dc.date:
        case $561398f2f029e0d0$export$4d213a7d364021dc.daterange:
        case $561398f2f029e0d0$export$4d213a7d364021dc.int4range:
        case $561398f2f029e0d0$export$4d213a7d364021dc.int8range:
        case $561398f2f029e0d0$export$4d213a7d364021dc.money:
        case $561398f2f029e0d0$export$4d213a7d364021dc.reltime:
        case $561398f2f029e0d0$export$4d213a7d364021dc.text:
        case $561398f2f029e0d0$export$4d213a7d364021dc.time:
        case $561398f2f029e0d0$export$4d213a7d364021dc.timestamptz:
        case $561398f2f029e0d0$export$4d213a7d364021dc.timetz:
        case $561398f2f029e0d0$export$4d213a7d364021dc.tsrange:
        case $561398f2f029e0d0$export$4d213a7d364021dc.tstzrange:
            return $561398f2f029e0d0$var$noop(value);
        default:
            // Return the value for remaining types
            return $561398f2f029e0d0$var$noop(value);
    }
};
const $561398f2f029e0d0$var$noop = (value)=>{
    return value;
};
const $561398f2f029e0d0$export$3c2e6d1b7583eee6 = (value)=>{
    switch(value){
        case 't':
            return true;
        case 'f':
            return false;
        default:
            return value;
    }
};
const $561398f2f029e0d0$export$a0a81dc3380ce7d3 = (value)=>{
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) return parsedValue;
    }
    return value;
};
const $561398f2f029e0d0$export$d5b7a8bf56ee1fe2 = (value)=>{
    if (typeof value === 'string') try {
        return JSON.parse(value);
    } catch (_a) {
        return value;
    }
    return value;
};
const $561398f2f029e0d0$export$45b10814cc054894 = (value, type)=>{
    if (typeof value !== 'string') return value;
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    // Confirm value is a Postgres array by checking curly brackets
    if (openBrace === '{' && closeBrace === '}') {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        // TODO: find a better solution to separate Postgres array data
        try {
            arr = JSON.parse('[' + valTrim + ']');
        } catch (_) {
            // WARNING: splitting on comma does not cover all edge cases
            arr = valTrim ? valTrim.split(',') : [];
        }
        return arr.map((val)=>$561398f2f029e0d0$export$3df02a362b86a91(type, val));
    }
    return value;
};
const $561398f2f029e0d0$export$eccf8c5d91d19e3a = (value)=>{
    if (typeof value === 'string') return value.replace(' ', 'T');
    return value;
};
const $561398f2f029e0d0$export$976fda7151b30cae = (socketUrl)=>{
    const wsUrl = new URL(socketUrl);
    wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, 'http');
    wsUrl.pathname = wsUrl.pathname.replace(/\/+$/, '') // remove all trailing slashes
    .replace(/\/socket\/websocket$/i, '') // remove the socket/websocket path
    .replace(/\/socket$/i, '') // remove the socket path
    .replace(/\/websocket$/i, ''); // remove the websocket path
    if (wsUrl.pathname === '' || wsUrl.pathname === '/') wsUrl.pathname = '/api/broadcast';
    else wsUrl.pathname = wsUrl.pathname + '/api/broadcast';
    return wsUrl.href;
};




class $54f8008b2d02768a$export$2e2bcd8739ae039 {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */ constructor(channel, event, payload = {}, timeout = (0, $14c34fa438c93719$export$7bd623b29ec8e1eb)){
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = undefined;
        this.ref = '';
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
    }
    resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = '';
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
    }
    send() {
        if (this._hasReceived('timeout')) return;
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
            topic: this.channel.topic,
            event: this.event,
            payload: this.payload,
            ref: this.ref,
            join_ref: this.channel._joinRef()
        });
    }
    updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        this.recHooks.push({
            status: status,
            callback: callback
        });
        return this;
    }
    startTimeout() {
        if (this.timeoutTimer) return;
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = (payload)=>{
            this._cancelRefEvent();
            this._cancelTimeout();
            this.receivedResp = payload;
            this._matchReceive(payload);
        };
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(()=>{
            this.trigger('timeout', {});
        }, this.timeout);
    }
    trigger(status, response) {
        if (this.refEvent) this.channel._trigger(this.refEvent, {
            status: status,
            response: response
        });
    }
    destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
    }
    _cancelRefEvent() {
        if (!this.refEvent) return;
        this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = undefined;
    }
    _matchReceive({ status: status, response: response }) {
        this.recHooks.filter((h)=>h.status === status).forEach((h)=>h.callback(response));
    }
    _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
    }
}



/*
  This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
  License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
*/ var $ecf8c8c6b073aa81$export$f1ce049df2794fb4;
(function(REALTIME_PRESENCE_LISTEN_EVENTS) {
    REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
})($ecf8c8c6b073aa81$export$f1ce049df2794fb4 || ($ecf8c8c6b073aa81$export$f1ce049df2794fb4 = {}));
class $ecf8c8c6b073aa81$export$2e2bcd8739ae039 {
    /**
     * Creates a Presence helper that keeps the local presence state in sync with the server.
     *
     * @param channel - The realtime channel to bind to.
     * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
     *
     * @example
     * ```ts
     * const presence = new RealtimePresence(channel)
     *
     * channel.on('presence', ({ event, key }) => {
     *   console.log(`Presence ${event} on ${key}`)
     * })
     * ```
     */ constructor(channel, opts){
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.enabled = false;
        this.caller = {
            onJoin: ()=>{},
            onLeave: ()=>{},
            onSync: ()=>{}
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
            state: 'presence_state',
            diff: 'presence_diff'
        };
        this.channel._on(events.state, {}, (newState)=>{
            const { onJoin: onJoin, onLeave: onLeave, onSync: onSync } = this.caller;
            this.joinRef = this.channel._joinRef();
            this.state = $ecf8c8c6b073aa81$export$2e2bcd8739ae039.syncState(this.state, newState, onJoin, onLeave);
            this.pendingDiffs.forEach((diff)=>{
                this.state = $ecf8c8c6b073aa81$export$2e2bcd8739ae039.syncDiff(this.state, diff, onJoin, onLeave);
            });
            this.pendingDiffs = [];
            onSync();
        });
        this.channel._on(events.diff, {}, (diff)=>{
            const { onJoin: onJoin, onLeave: onLeave, onSync: onSync } = this.caller;
            if (this.inPendingSyncState()) this.pendingDiffs.push(diff);
            else {
                this.state = $ecf8c8c6b073aa81$export$2e2bcd8739ae039.syncDiff(this.state, diff, onJoin, onLeave);
                onSync();
            }
        });
        this.onJoin((key, currentPresences, newPresences)=>{
            this.channel._trigger('presence', {
                event: 'join',
                key: key,
                currentPresences: currentPresences,
                newPresences: newPresences
            });
        });
        this.onLeave((key, currentPresences, leftPresences)=>{
            this.channel._trigger('presence', {
                event: 'leave',
                key: key,
                currentPresences: currentPresences,
                leftPresences: leftPresences
            });
        });
        this.onSync(()=>{
            this.channel._trigger('presence', {
                event: 'sync'
            });
        });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */ static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences)=>{
            if (!transformedState[key]) leaves[key] = presences;
        });
        this.map(transformedState, (key, newPresences)=>{
            const currentPresences = state[key];
            if (currentPresences) {
                const newPresenceRefs = newPresences.map((m)=>m.presence_ref);
                const curPresenceRefs = currentPresences.map((m)=>m.presence_ref);
                const joinedPresences = newPresences.filter((m)=>curPresenceRefs.indexOf(m.presence_ref) < 0);
                const leftPresences = currentPresences.filter((m)=>newPresenceRefs.indexOf(m.presence_ref) < 0);
                if (joinedPresences.length > 0) joins[key] = joinedPresences;
                if (leftPresences.length > 0) leaves[key] = leftPresences;
            } else joins[key] = newPresences;
        });
        return this.syncDiff(state, {
            joins: joins,
            leaves: leaves
        }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */ static syncDiff(state, diff, onJoin, onLeave) {
        const { joins: joins, leaves: leaves } = {
            joins: this.transformState(diff.joins),
            leaves: this.transformState(diff.leaves)
        };
        if (!onJoin) onJoin = ()=>{};
        if (!onLeave) onLeave = ()=>{};
        this.map(joins, (key, newPresences)=>{
            var _a;
            const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
            state[key] = this.cloneDeep(newPresences);
            if (currentPresences.length > 0) {
                const joinedPresenceRefs = state[key].map((m)=>m.presence_ref);
                const curPresences = currentPresences.filter((m)=>joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                state[key].unshift(...curPresences);
            }
            onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences)=>{
            let currentPresences = state[key];
            if (!currentPresences) return;
            const presenceRefsToRemove = leftPresences.map((m)=>m.presence_ref);
            currentPresences = currentPresences.filter((m)=>presenceRefsToRemove.indexOf(m.presence_ref) < 0);
            state[key] = currentPresences;
            onLeave(key, currentPresences, leftPresences);
            if (currentPresences.length === 0) delete state[key];
        });
        return state;
    }
    /** @internal */ static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key)=>func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */ static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key)=>{
            const presences = state[key];
            if ('metas' in presences) newState[key] = presences.metas.map((presence)=>{
                presence['presence_ref'] = presence['phx_ref'];
                delete presence['phx_ref'];
                delete presence['phx_ref_prev'];
                return presence;
            });
            else newState[key] = presences;
            return newState;
        }, {});
    }
    /** @internal */ static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */ onJoin(callback) {
        this.caller.onJoin = callback;
    }
    /** @internal */ onLeave(callback) {
        this.caller.onLeave = callback;
    }
    /** @internal */ onSync(callback) {
        this.caller.onSync = callback;
    }
    /** @internal */ inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
}



var $297046795881726a$export$bc171c571098b6c4;
(function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
})($297046795881726a$export$bc171c571098b6c4 || ($297046795881726a$export$bc171c571098b6c4 = {}));
var $297046795881726a$export$9e3fe8e487ef792e;
(function(REALTIME_LISTEN_TYPES) {
    REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
})($297046795881726a$export$9e3fe8e487ef792e || ($297046795881726a$export$9e3fe8e487ef792e = {}));
var $297046795881726a$export$a6885b926af646a2;
(function(REALTIME_SUBSCRIBE_STATES) {
    REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})($297046795881726a$export$a6885b926af646a2 || ($297046795881726a$export$a6885b926af646a2 = {}));
const $297046795881726a$export$154db638d9c0559e = (0, $14c34fa438c93719$export$b83816118db74fe7);
class $297046795881726a$export$2e2bcd8739ae039 {
    /**
     * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
     *
     * The topic determines which realtime stream you are subscribing to. Config options let you
     * enable acknowledgement for broadcasts, presence tracking, or private channels.
     *
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
     * ```
     */ constructor(/** Topic name can be any string. */ topic, params = {
        config: {}
    }, socket){
        var _a, _b;
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, '');
        this.params.config = Object.assign({
            broadcast: {
                ack: false,
                self: false
            },
            presence: {
                key: '',
                enabled: false
            },
            private: false
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new (0, $54f8008b2d02768a$export$2e2bcd8739ae039)(this, (0, $14c34fa438c93719$export$8db7548e65d6ea55).join, this.params, this.timeout);
        this.rejoinTimer = new (0, $1eb83973107d60cf$export$2e2bcd8739ae039)(()=>this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive('ok', ()=>{
            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).joined;
            this.rejoinTimer.reset();
            this.pushBuffer.forEach((pushEvent)=>pushEvent.send());
            this.pushBuffer = [];
        });
        this._onClose(()=>{
            this.rejoinTimer.reset();
            this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).closed;
            this.socket._remove(this);
        });
        this._onError((reason)=>{
            if (this._isLeaving() || this._isClosed()) return;
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('timeout', ()=>{
            if (!this._isJoining()) return;
            this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('error', (reason)=>{
            if (this._isLeaving() || this._isClosed()) return;
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this._on((0, $14c34fa438c93719$export$8db7548e65d6ea55).reply, {}, (payload, ref)=>{
            this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new (0, $ecf8c8c6b073aa81$export$2e2bcd8739ae039)(this);
        this.broadcastEndpointURL = (0, $561398f2f029e0d0$export$976fda7151b30cae)(this.socket.endPoint);
        this.private = this.params.config.private || false;
        if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
    }
    /** Subscribe registers your client with the server */ subscribe(callback, timeout = this.timeout) {
        var _a, _b, _c;
        if (!this.socket.isConnected()) this.socket.connect();
        if (this.state == (0, $14c34fa438c93719$export$b83816118db74fe7).closed) {
            const { config: { broadcast: broadcast, presence: presence, private: isPrivate } } = this.params;
            const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r)=>r.filter)) !== null && _b !== void 0 ? _b : [];
            const presence_enabled = !!this.bindings[$297046795881726a$export$9e3fe8e487ef792e.PRESENCE] && this.bindings[$297046795881726a$export$9e3fe8e487ef792e.PRESENCE].length > 0 || ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
            const accessTokenPayload = {};
            const config = {
                broadcast: broadcast,
                presence: Object.assign(Object.assign({}, presence), {
                    enabled: presence_enabled
                }),
                postgres_changes: postgres_changes,
                private: isPrivate
            };
            if (this.socket.accessTokenValue) accessTokenPayload.access_token = this.socket.accessTokenValue;
            this._onError((e)=>callback === null || callback === void 0 ? void 0 : callback($297046795881726a$export$a6885b926af646a2.CHANNEL_ERROR, e));
            this._onClose(()=>callback === null || callback === void 0 ? void 0 : callback($297046795881726a$export$a6885b926af646a2.CLOSED));
            this.updateJoinPayload(Object.assign({
                config: config
            }, accessTokenPayload));
            this.joinedOnce = true;
            this._rejoin(timeout);
            this.joinPush.receive('ok', async ({ postgres_changes: postgres_changes })=>{
                var _a;
                // Only refresh auth if using callback-based tokens
                if (!this.socket._isManualToken()) this.socket.setAuth();
                if (postgres_changes === undefined) {
                    callback === null || callback === void 0 || callback($297046795881726a$export$a6885b926af646a2.SUBSCRIBED);
                    return;
                } else {
                    const clientPostgresBindings = this.bindings.postgres_changes;
                    const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                    const newPostgresBindings = [];
                    for(let i = 0; i < bindingsLen; i++){
                        const clientPostgresBinding = clientPostgresBindings[i];
                        const { filter: { event: event, schema: schema, table: table, filter: filter } } = clientPostgresBinding;
                        const serverPostgresFilter = postgres_changes && postgres_changes[i];
                        if (serverPostgresFilter && serverPostgresFilter.event === event && $297046795881726a$export$2e2bcd8739ae039.isFilterValueEqual(serverPostgresFilter.schema, schema) && $297046795881726a$export$2e2bcd8739ae039.isFilterValueEqual(serverPostgresFilter.table, table) && $297046795881726a$export$2e2bcd8739ae039.isFilterValueEqual(serverPostgresFilter.filter, filter)) newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), {
                            id: serverPostgresFilter.id
                        }));
                        else {
                            this.unsubscribe();
                            this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).errored;
                            callback === null || callback === void 0 || callback($297046795881726a$export$a6885b926af646a2.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                            return;
                        }
                    }
                    this.bindings.postgres_changes = newPostgresBindings;
                    callback && callback($297046795881726a$export$a6885b926af646a2.SUBSCRIBED);
                    return;
                }
            }).receive('error', (error)=>{
                this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).errored;
                callback === null || callback === void 0 || callback($297046795881726a$export$a6885b926af646a2.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                return;
            }).receive('timeout', ()=>{
                callback === null || callback === void 0 || callback($297046795881726a$export$a6885b926af646a2.TIMED_OUT);
                return;
            });
        }
        return this;
    }
    /**
     * Returns the current presence state for this channel.
     *
     * The shape is a map keyed by presence key (for example a user id) where each entry contains the
     * tracked metadata for that user.
     */ presenceState() {
        return this.presence.state;
    }
    /**
     * Sends the supplied payload to the presence tracker so other subscribers can see that this
     * client is online. Use `untrack` to stop broadcasting presence for the same key.
     */ async track(payload, opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'track',
            payload: payload
        }, opts.timeout || this.timeout);
    }
    /**
     * Removes the current presence state for this client.
     */ async untrack(opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'untrack'
        }, opts);
    }
    on(type, filter, callback) {
        if (this.state === (0, $14c34fa438c93719$export$b83816118db74fe7).joined && type === $297046795881726a$export$9e3fe8e487ef792e.PRESENCE) {
            this.socket.log('channel', `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
            this.unsubscribe().then(async ()=>await this.subscribe());
        }
        return this._on(type, filter, callback);
    }
    /**
     * Sends a broadcast message explicitly via REST API.
     *
     * This method always uses the REST API endpoint regardless of WebSocket connection state.
     * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
     *
     * @param event The name of the broadcast event
     * @param payload Payload to be sent (required)
     * @param opts Options including timeout
     * @returns Promise resolving to object with success status, and error details if failed
     */ async httpSend(event, payload, opts = {}) {
        var _a;
        if (payload === undefined || payload === null) return Promise.reject('Payload is required for httpSend()');
        const headers = {
            apikey: this.socket.apiKey ? this.socket.apiKey : '',
            'Content-Type': 'application/json'
        };
        if (this.socket.accessTokenValue) headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
        const options = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                messages: [
                    {
                        topic: this.subTopic,
                        event: event,
                        payload: payload,
                        private: this.private
                    }
                ]
            })
        };
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
        if (response.status === 202) return {
            success: true
        };
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
        } catch (_b) {}
        return Promise.reject(new Error(errorMessage));
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */ async send(args, opts = {}) {
        var _a, _b;
        if (!this._canPush() && args.type === 'broadcast') {
            console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
            const { event: event, payload: endpoint_payload } = args;
            const headers = {
                apikey: this.socket.apiKey ? this.socket.apiKey : '',
                'Content-Type': 'application/json'
            };
            if (this.socket.accessTokenValue) headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
            const options = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    messages: [
                        {
                            topic: this.subTopic,
                            event: event,
                            payload: endpoint_payload,
                            private: this.private
                        }
                    ]
                })
            };
            try {
                const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                return response.ok ? 'ok' : 'error';
            } catch (error) {
                if (error.name === 'AbortError') return 'timed out';
                else return 'error';
            }
        } else return new Promise((resolve)=>{
            var _a, _b, _c;
            const push = this._push(args.type, args, opts.timeout || this.timeout);
            if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) resolve('ok');
            push.receive('ok', ()=>resolve('ok'));
            push.receive('error', ()=>resolve('error'));
            push.receive('timeout', ()=>resolve('timed out'));
        });
    }
    /**
     * Updates the payload that will be sent the next time the channel joins (reconnects).
     * Useful for rotating access tokens or updating config without re-creating the channel.
     */ updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */ unsubscribe(timeout = this.timeout) {
        this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).leaving;
        const onClose = ()=>{
            this.socket.log('channel', `leave ${this.topic}`);
            this._trigger((0, $14c34fa438c93719$export$8db7548e65d6ea55).close, 'leave', this._joinRef());
        };
        this.joinPush.destroy();
        let leavePush = null;
        return new Promise((resolve)=>{
            leavePush = new (0, $54f8008b2d02768a$export$2e2bcd8739ae039)(this, (0, $14c34fa438c93719$export$8db7548e65d6ea55).leave, {}, timeout);
            leavePush.receive('ok', ()=>{
                onClose();
                resolve('ok');
            }).receive('timeout', ()=>{
                onClose();
                resolve('timed out');
            }).receive('error', ()=>{
                resolve('error');
            });
            leavePush.send();
            if (!this._canPush()) leavePush.trigger('ok', {});
        }).finally(()=>{
            leavePush === null || leavePush === void 0 || leavePush.destroy();
        });
    }
    /**
     * Teardown the channel.
     *
     * Destroys and stops related timers.
     */ teardown() {
        this.pushBuffer.forEach((push)=>push.destroy());
        this.pushBuffer = [];
        this.rejoinTimer.reset();
        this.joinPush.destroy();
        this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).closed;
        this.bindings = {};
    }
    /** @internal */ async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), {
            signal: controller.signal
        }));
        clearTimeout(id);
        return response;
    }
    /** @internal */ _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        let pushEvent = new (0, $54f8008b2d02768a$export$2e2bcd8739ae039)(this, event, payload, timeout);
        if (this._canPush()) pushEvent.send();
        else this._addToPushBuffer(pushEvent);
        return pushEvent;
    }
    /** @internal */ _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
        // Enforce buffer size limit
        if (this.pushBuffer.length > (0, $14c34fa438c93719$export$f227fe8351a81f4a)) {
            const removedPush = this.pushBuffer.shift();
            if (removedPush) {
                removedPush.destroy();
                this.socket.log('channel', `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
            }
        }
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */ _onMessage(_event, payload, _ref) {
        return payload;
    }
    /** @internal */ _isMember(topic) {
        return this.topic === topic;
    }
    /** @internal */ _joinRef() {
        return this.joinPush.ref;
    }
    /** @internal */ _trigger(type, payload, ref) {
        var _a, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close: close, error: error, leave: leave, join: join } = (0, $14c34fa438c93719$export$8db7548e65d6ea55);
        const events = [
            close,
            error,
            leave,
            join
        ];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) return;
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) throw 'channel onMessage callbacks must return the payload, modified or unmodified';
        if ([
            'insert',
            'update',
            'delete'
        ].includes(typeLower)) (_a = this.bindings.postgres_changes) === null || _a === void 0 || _a.filter((bind)=>{
            var _a, _b, _c;
            return ((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' || ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
        }).map((bind)=>bind.callback(handledPayload, ref));
        else (_b = this.bindings[typeLower]) === null || _b === void 0 || _b.filter((bind)=>{
            var _a, _b, _c, _d, _e, _f;
            if ([
                'broadcast',
                'presence',
                'postgres_changes'
            ].includes(typeLower)) {
                if ('id' in bind) {
                    const bindId = bind.id;
                    const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                    return bindId && ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) && (bindEvent === '*' || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
                } else {
                    const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
                    return bindEvent === '*' || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
                }
            } else return bind.type.toLocaleLowerCase() === typeLower;
        }).map((bind)=>{
            if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                const postgresChanges = handledPayload.data;
                const { schema: schema, table: table, commit_timestamp: commit_timestamp, type: type, errors: errors } = postgresChanges;
                const enrichedPayload = {
                    schema: schema,
                    table: table,
                    commit_timestamp: commit_timestamp,
                    eventType: type,
                    new: {},
                    old: {},
                    errors: errors
                };
                handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
            }
            bind.callback(handledPayload, ref);
        });
    }
    /** @internal */ _isClosed() {
        return this.state === (0, $14c34fa438c93719$export$b83816118db74fe7).closed;
    }
    /** @internal */ _isJoined() {
        return this.state === (0, $14c34fa438c93719$export$b83816118db74fe7).joined;
    }
    /** @internal */ _isJoining() {
        return this.state === (0, $14c34fa438c93719$export$b83816118db74fe7).joining;
    }
    /** @internal */ _isLeaving() {
        return this.state === (0, $14c34fa438c93719$export$b83816118db74fe7).leaving;
    }
    /** @internal */ _replyEventName(ref) {
        return `chan_reply_${ref}`;
    }
    /** @internal */ _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
            type: typeLower,
            filter: filter,
            callback: callback
        };
        if (this.bindings[typeLower]) this.bindings[typeLower].push(binding);
        else this.bindings[typeLower] = [
            binding
        ];
        return this;
    }
    /** @internal */ _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        if (this.bindings[typeLower]) this.bindings[typeLower] = this.bindings[typeLower].filter((bind)=>{
            var _a;
            return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && $297046795881726a$export$2e2bcd8739ae039.isEqual(bind.filter, filter));
        });
        return this;
    }
    /** @internal */ static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;
        for(const k in obj1){
            if (obj1[k] !== obj2[k]) return false;
        }
        return true;
    }
    /**
     * Compares two optional filter values for equality.
     * Treats undefined, null, and empty string as equivalent empty values.
     * @internal
     */ static isFilterValueEqual(serverValue, clientValue) {
        const normalizedServer = serverValue !== null && serverValue !== void 0 ? serverValue : undefined;
        const normalizedClient = clientValue !== null && clientValue !== void 0 ? clientValue : undefined;
        return normalizedServer === normalizedClient;
    }
    /** @internal */ _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) this._rejoin();
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */ _onClose(callback) {
        this._on((0, $14c34fa438c93719$export$8db7548e65d6ea55).close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */ _onError(callback) {
        this._on((0, $14c34fa438c93719$export$8db7548e65d6ea55).error, {}, (reason)=>callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */ _canPush() {
        return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */ _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) return;
        this.socket._leaveOpenTopic(this.topic);
        this.state = (0, $14c34fa438c93719$export$b83816118db74fe7).joining;
        this.joinPush.resend(timeout);
    }
    /** @internal */ _getPayloadRecords(payload) {
        const records = {
            new: {},
            old: {}
        };
        if (payload.type === 'INSERT' || payload.type === 'UPDATE') records.new = $561398f2f029e0d0$export$20ce708a1f594c5e(payload.columns, payload.record);
        if (payload.type === 'UPDATE' || payload.type === 'DELETE') records.old = $561398f2f029e0d0$export$20ce708a1f594c5e(payload.columns, payload.old_record);
        return records;
    }
}


const $386baf7f763905e6$var$noop = ()=>{};
// Connection-related constants
const $386baf7f763905e6$var$CONNECTION_TIMEOUTS = {
    HEARTBEAT_INTERVAL: 25000,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100
};
const $386baf7f763905e6$var$RECONNECT_INTERVALS = [
    1000,
    2000,
    5000,
    10000
];
const $386baf7f763905e6$var$DEFAULT_RECONNECT_FALLBACK = 10000;
const $386baf7f763905e6$var$WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class $386baf7f763905e6$export$2e2bcd8739ae039 {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.heartbeatCallback The optional function to handle heartbeat status.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.logLevel Sets the log level for Realtime
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * client.connect()
     * ```
     */ constructor(endPoint, options){
        var _a;
        this.accessTokenValue = null;
        this.apiKey = null;
        this._manuallySetToken = false;
        this.channels = new Array();
        this.endPoint = '';
        this.httpEndpoint = '';
        /** @deprecated headers cannot be set on websocket connections */ this.headers = {};
        this.params = {};
        this.timeout = (0, $14c34fa438c93719$export$7bd623b29ec8e1eb);
        this.transport = null;
        this.heartbeatIntervalMs = $386baf7f763905e6$var$CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.heartbeatTimer = undefined;
        this.pendingHeartbeatRef = null;
        this.heartbeatCallback = $386baf7f763905e6$var$noop;
        this.ref = 0;
        this.reconnectTimer = null;
        this.vsn = (0, $14c34fa438c93719$export$90c89f9664aa9117);
        this.logger = $386baf7f763905e6$var$noop;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new (0, $5eea4ff75501b31d$export$2e2bcd8739ae039)();
        this.stateChangeCallbacks = {
            open: [],
            close: [],
            error: [],
            message: []
        };
        this.accessToken = null;
        this._connectionState = 'disconnected';
        this._wasManualDisconnect = false;
        this._authPromise = null;
        /**
         * Use either custom fetch, if provided, or default fetch to make HTTP requests
         *
         * @internal
         */ this._resolveFetch = (customFetch)=>{
            if (customFetch) return (...args)=>customFetch(...args);
            return (...args)=>fetch(...args);
        };
        // Validate required parameters
        if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) throw new Error('API key is required to connect to Realtime');
        this.apiKey = options.params.apikey;
        // Initialize endpoint URLs
        this.endPoint = `${endPoint}/${(0, $14c34fa438c93719$export$b2688bfb999f5751).websocket}`;
        this.httpEndpoint = (0, $561398f2f029e0d0$export$976fda7151b30cae)(endPoint);
        this._initializeOptions(options);
        this._setupReconnectionTimer();
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     */ connect() {
        // Skip if already connecting, disconnecting, or connected
        if (this.isConnecting() || this.isDisconnecting() || this.conn !== null && this.isConnected()) return;
        this._setConnectionState('connecting');
        // Trigger auth if needed and not already in progress
        // This ensures auth is called for standalone RealtimeClient usage
        // while avoiding race conditions with SupabaseClient's immediate setAuth call
        if (this.accessToken && !this._authPromise) this._setAuthSafely('connect');
        // Establish WebSocket connection
        if (this.transport) // Use custom transport if provided
        this.conn = new this.transport(this.endpointURL());
        else // Try to use native WebSocket
        try {
            this.conn = (0, $bd9835a6595fa653$export$2e2bcd8739ae039).createWebSocket(this.endpointURL());
        } catch (error) {
            this._setConnectionState('disconnected');
            const errorMessage = error.message;
            // Provide helpful error message based on environment
            if (errorMessage.includes('Node.js')) throw new Error(`${errorMessage}\n\n` + 'To use Realtime in Node.js, you need to provide a WebSocket implementation:\n\n' + 'Option 1: Use Node.js 22+ which has native WebSocket support\n' + 'Option 2: Install and provide the "ws" package:\n\n' + '  npm install ws\n\n' + '  import ws from "ws"\n' + '  const client = new RealtimeClient(url, {\n' + '    ...options,\n' + '    transport: ws\n' + '  })');
            throw new Error(`WebSocket not available: ${errorMessage}`);
        }
        this._setupConnectionHandlers();
    }
    /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */ endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, {
            vsn: this.vsn
        }));
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */ disconnect(code, reason) {
        if (this.isDisconnecting()) return;
        this._setConnectionState('disconnecting', true);
        if (this.conn) {
            // Setup fallback timer to prevent hanging in disconnecting state
            const fallbackTimer = setTimeout(()=>{
                this._setConnectionState('disconnected');
            }, 100);
            this.conn.onclose = ()=>{
                clearTimeout(fallbackTimer);
                this._setConnectionState('disconnected');
            };
            // Close the WebSocket connection if close method exists
            if (typeof this.conn.close === 'function') {
                if (code) this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                else this.conn.close();
            }
            this._teardownConnection();
        } else this._setConnectionState('disconnected');
    }
    /**
     * Returns all created channels
     */ getChannels() {
        return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */ async removeChannel(channel) {
        const status = await channel.unsubscribe();
        if (this.channels.length === 0) this.disconnect();
        return status;
    }
    /**
     * Unsubscribes and removes all channels
     */ async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel)=>channel.unsubscribe()));
        this.channels = [];
        this.disconnect();
        return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */ log(kind, msg, data) {
        this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */ connectionState() {
        switch(this.conn && this.conn.readyState){
            case (0, $14c34fa438c93719$export$a6d0320a1563d49e).connecting:
                return (0, $14c34fa438c93719$export$deda39003d27273).Connecting;
            case (0, $14c34fa438c93719$export$a6d0320a1563d49e).open:
                return (0, $14c34fa438c93719$export$deda39003d27273).Open;
            case (0, $14c34fa438c93719$export$a6d0320a1563d49e).closing:
                return (0, $14c34fa438c93719$export$deda39003d27273).Closing;
            default:
                return (0, $14c34fa438c93719$export$deda39003d27273).Closed;
        }
    }
    /**
     * Returns `true` is the connection is open.
     */ isConnected() {
        return this.connectionState() === (0, $14c34fa438c93719$export$deda39003d27273).Open;
    }
    /**
     * Returns `true` if the connection is currently connecting.
     */ isConnecting() {
        return this._connectionState === 'connecting';
    }
    /**
     * Returns `true` if the connection is currently disconnecting.
     */ isDisconnecting() {
        return this._connectionState === 'disconnecting';
    }
    /**
     * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
     *
     * Topics are automatically prefixed with `realtime:` to match the Realtime service.
     * If a channel with the same topic already exists it will be returned instead of creating
     * a duplicate connection.
     */ channel(topic, params = {
        config: {}
    }) {
        const realtimeTopic = `realtime:${topic}`;
        const exists = this.getChannels().find((c)=>c.topic === realtimeTopic);
        if (!exists) {
            const chan = new (0, $297046795881726a$export$2e2bcd8739ae039)(`realtime:${topic}`, params, this);
            this.channels.push(chan);
            return chan;
        } else return exists;
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */ push(data) {
        const { topic: topic, event: event, payload: payload, ref: ref } = data;
        const callback = ()=>{
            this.encode(data, (result)=>{
                var _a;
                (_a = this.conn) === null || _a === void 0 || _a.send(result);
            });
        };
        this.log('push', `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) callback();
        else this.sendBuffer.push(callback);
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * When a token is explicitly provided, it will be preserved across channel operations
     * (including removeChannel and resubscribe). The `accessToken` callback will not be
     * invoked until `setAuth()` is called without arguments.
     *
     * @param token A JWT string to override the token set on the client.
     *
     * @example
     * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
     * client.realtime.setAuth('my-custom-jwt')
     *
     * // Switch back to using the accessToken callback
     * client.realtime.setAuth()
     */ async setAuth(token = null) {
        this._authPromise = this._performAuth(token);
        try {
            await this._authPromise;
        } finally{
            this._authPromise = null;
        }
    }
    /**
     * Returns true if the current access token was explicitly set via setAuth(token),
     * false if it was obtained via the accessToken callback.
     * @internal
     */ _isManualToken() {
        return this._manuallySetToken;
    }
    /**
     * Sends a heartbeat message if the socket is connected.
     */ async sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
            try {
                this.heartbeatCallback('disconnected');
            } catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            return;
        }
        // Handle heartbeat timeout and force reconnection if needed
        if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
            this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
            try {
                this.heartbeatCallback('timeout');
            } catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            // Force reconnection after heartbeat timeout
            this._wasManualDisconnect = false;
            (_a = this.conn) === null || _a === void 0 || _a.close((0, $14c34fa438c93719$export$5e80cf62e56a877b), 'heartbeat timeout');
            setTimeout(()=>{
                var _a;
                if (!this.isConnected()) (_a = this.reconnectTimer) === null || _a === void 0 || _a.scheduleTimeout();
            }, $386baf7f763905e6$var$CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
            return;
        }
        // Send heartbeat message to server
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: this.pendingHeartbeatRef
        });
        try {
            this.heartbeatCallback('sent');
        } catch (e) {
            this.log('error', 'error in heartbeat callback', e);
        }
        this._setAuthSafely('heartbeat');
    }
    /**
     * Sets a callback that receives lifecycle events for internal heartbeat messages.
     * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
     */ onHeartbeat(callback) {
        this.heartbeatCallback = callback;
    }
    /**
     * Flushes send buffer
     */ flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
            this.sendBuffer.forEach((callback)=>callback());
            this.sendBuffer = [];
        }
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */ _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) this.ref = 0;
        else this.ref = newRef;
        return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */ _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c)=>c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
            this.log('transport', `leaving duplicate topic "${topic}"`);
            dupChannel.unsubscribe();
        }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */ _remove(channel) {
        this.channels = this.channels.filter((c)=>c.topic !== channel.topic);
    }
    /** @internal */ _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg)=>{
            // Handle heartbeat responses
            if (msg.topic === 'phoenix' && msg.event === 'phx_reply') try {
                this.heartbeatCallback(msg.payload.status === 'ok' ? 'ok' : 'error');
            } catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            // Handle pending heartbeat reference cleanup
            if (msg.ref && msg.ref === this.pendingHeartbeatRef) this.pendingHeartbeatRef = null;
            // Log incoming message
            const { topic: topic, event: event, payload: payload, ref: ref } = msg;
            const refString = ref ? `(${ref})` : '';
            const status = payload.status || '';
            this.log('receive', `${status} ${topic} ${event} ${refString}`.trim(), payload);
            // Route message to appropriate channels
            this.channels.filter((channel)=>channel._isMember(topic)).forEach((channel)=>channel._trigger(event, payload, ref));
            this._triggerStateCallbacks('message', msg);
        });
    }
    /**
     * Clear specific timer
     * @internal
     */ _clearTimer(timer) {
        var _a;
        if (timer === 'heartbeat' && this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        } else if (timer === 'reconnect') (_a = this.reconnectTimer) === null || _a === void 0 || _a.reset();
    }
    /**
     * Clear all timers
     * @internal
     */ _clearAllTimers() {
        this._clearTimer('heartbeat');
        this._clearTimer('reconnect');
    }
    /**
     * Setup connection handlers for WebSocket events
     * @internal
     */ _setupConnectionHandlers() {
        if (!this.conn) return;
        // Set binary type if supported (browsers and most WebSocket implementations)
        if ('binaryType' in this.conn) this.conn.binaryType = 'arraybuffer';
        this.conn.onopen = ()=>this._onConnOpen();
        this.conn.onerror = (error)=>this._onConnError(error);
        this.conn.onmessage = (event)=>this._onConnMessage(event);
        this.conn.onclose = (event)=>this._onConnClose(event);
        if (this.conn.readyState === (0, $14c34fa438c93719$export$a6d0320a1563d49e).open) this._onConnOpen();
    }
    /**
     * Teardown connection and cleanup resources
     * @internal
     */ _teardownConnection() {
        if (this.conn) {
            if (this.conn.readyState === (0, $14c34fa438c93719$export$a6d0320a1563d49e).open || this.conn.readyState === (0, $14c34fa438c93719$export$a6d0320a1563d49e).connecting) try {
                this.conn.close();
            } catch (e) {
                this.log('error', 'Error closing connection', e);
            }
            this.conn.onopen = null;
            this.conn.onerror = null;
            this.conn.onmessage = null;
            this.conn.onclose = null;
            this.conn = null;
        }
        this._clearAllTimers();
        this._terminateWorker();
        this.channels.forEach((channel)=>channel.teardown());
    }
    /** @internal */ _onConnOpen() {
        this._setConnectionState('connected');
        this.log('transport', `connected to ${this.endpointURL()}`);
        // Wait for any pending auth operations before flushing send buffer
        // This ensures channel join messages include the correct access token
        const authPromise = this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise.then(()=>{
            this.flushSendBuffer();
        }).catch((e)=>{
            this.log('error', 'error waiting for auth on connect', e);
            // Proceed anyway to avoid hanging connections
            this.flushSendBuffer();
        });
        this._clearTimer('reconnect');
        if (!this.worker) this._startHeartbeat();
        else if (!this.workerRef) this._startWorkerHeartbeat();
        this._triggerStateCallbacks('open');
    }
    /** @internal */ _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(()=>this.sendHeartbeat(), this.heartbeatIntervalMs);
    }
    /** @internal */ _startWorkerHeartbeat() {
        if (this.workerUrl) this.log('worker', `starting worker for from ${this.workerUrl}`);
        else this.log('worker', `starting default worker`);
        const objectUrl = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(objectUrl);
        this.workerRef.onerror = (error)=>{
            this.log('worker', 'worker error', error.message);
            this._terminateWorker();
        };
        this.workerRef.onmessage = (event)=>{
            if (event.data.event === 'keepAlive') this.sendHeartbeat();
        };
        this.workerRef.postMessage({
            event: 'start',
            interval: this.heartbeatIntervalMs
        });
    }
    /**
     * Terminate the Web Worker and clear the reference
     * @internal
     */ _terminateWorker() {
        if (this.workerRef) {
            this.log('worker', 'terminating worker');
            this.workerRef.terminate();
            this.workerRef = undefined;
        }
    }
    /** @internal */ _onConnClose(event) {
        var _a;
        this._setConnectionState('disconnected');
        this.log('transport', 'close', event);
        this._triggerChanError();
        this._clearTimer('heartbeat');
        // Only schedule reconnection if it wasn't a manual disconnect
        if (!this._wasManualDisconnect) (_a = this.reconnectTimer) === null || _a === void 0 || _a.scheduleTimeout();
        this._triggerStateCallbacks('close', event);
    }
    /** @internal */ _onConnError(error) {
        this._setConnectionState('disconnected');
        this.log('transport', `${error}`);
        this._triggerChanError();
        this._triggerStateCallbacks('error', error);
    }
    /** @internal */ _triggerChanError() {
        this.channels.forEach((channel)=>channel._trigger((0, $14c34fa438c93719$export$8db7548e65d6ea55).error));
    }
    /** @internal */ _appendParams(url, params) {
        if (Object.keys(params).length === 0) return url;
        const prefix = url.match(/\?/) ? '&' : '?';
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
    }
    _workerObjectUrl(url) {
        let result_url;
        if (url) result_url = url;
        else {
            const blob = new Blob([
                $386baf7f763905e6$var$WORKER_SCRIPT
            ], {
                type: 'application/javascript'
            });
            result_url = URL.createObjectURL(blob);
        }
        return result_url;
    }
    /**
     * Set connection state with proper state management
     * @internal
     */ _setConnectionState(state, manual = false) {
        this._connectionState = state;
        if (state === 'connecting') this._wasManualDisconnect = false;
        else if (state === 'disconnecting') this._wasManualDisconnect = manual;
    }
    /**
     * Perform the actual auth operation
     * @internal
     */ async _performAuth(token = null) {
        let tokenToSend;
        let isManualToken = false;
        if (token) {
            tokenToSend = token;
            // Track if this is a manually-provided token
            isManualToken = true;
        } else if (this.accessToken) // Call the accessToken callback to get fresh token
        try {
            tokenToSend = await this.accessToken();
        } catch (e) {
            this.log('error', 'Error fetching access token from callback', e);
            // Fall back to cached value if callback fails
            tokenToSend = this.accessTokenValue;
        }
        else tokenToSend = this.accessTokenValue;
        // Track whether this token was manually set or fetched via callback
        if (isManualToken) this._manuallySetToken = true;
        else if (this.accessToken) // If we used the callback, clear the manual flag
        this._manuallySetToken = false;
        if (this.accessTokenValue != tokenToSend) {
            this.accessTokenValue = tokenToSend;
            this.channels.forEach((channel)=>{
                const payload = {
                    access_token: tokenToSend,
                    version: (0, $14c34fa438c93719$export$363ebe89e6e7aeef)
                };
                tokenToSend && channel.updateJoinPayload(payload);
                if (channel.joinedOnce && channel._isJoined()) channel._push((0, $14c34fa438c93719$export$8db7548e65d6ea55).access_token, {
                    access_token: tokenToSend
                });
            });
        }
    }
    /**
     * Wait for any in-flight auth operations to complete
     * @internal
     */ async _waitForAuthIfNeeded() {
        if (this._authPromise) await this._authPromise;
    }
    /**
     * Safely call setAuth with standardized error handling
     * @internal
     */ _setAuthSafely(context = 'general') {
        // Only refresh auth if using callback-based tokens
        if (!this._isManualToken()) this.setAuth().catch((e)=>{
            this.log('error', `Error setting auth in ${context}`, e);
        });
    }
    /**
     * Trigger state change callbacks with proper error handling
     * @internal
     */ _triggerStateCallbacks(event, data) {
        try {
            this.stateChangeCallbacks[event].forEach((callback)=>{
                try {
                    callback(data);
                } catch (e) {
                    this.log('error', `error in ${event} callback`, e);
                }
            });
        } catch (e) {
            this.log('error', `error triggering ${event} callbacks`, e);
        }
    }
    /**
     * Setup reconnection timer with proper configuration
     * @internal
     */ _setupReconnectionTimer() {
        this.reconnectTimer = new (0, $1eb83973107d60cf$export$2e2bcd8739ae039)(async ()=>{
            setTimeout(async ()=>{
                await this._waitForAuthIfNeeded();
                if (!this.isConnected()) this.connect();
            }, $386baf7f763905e6$var$CONNECTION_TIMEOUTS.RECONNECT_DELAY);
        }, this.reconnectAfterMs);
    }
    /**
     * Initialize client options with defaults
     * @internal
     */ _initializeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Set defaults
        this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
        this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : (0, $14c34fa438c93719$export$7bd623b29ec8e1eb);
        this.heartbeatIntervalMs = (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : $386baf7f763905e6$var$CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
        this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
        this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : $386baf7f763905e6$var$noop;
        this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : (0, $14c34fa438c93719$export$90c89f9664aa9117);
        // Handle special cases
        if (options === null || options === void 0 ? void 0 : options.params) this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.logger) this.logger = options.logger;
        if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
            this.logLevel = options.logLevel || options.log_level;
            this.params = Object.assign(Object.assign({}, this.params), {
                log_level: this.logLevel
            });
        }
        // Set up functions with defaults
        this.reconnectAfterMs = (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : (tries)=>{
            return $386baf7f763905e6$var$RECONNECT_INTERVALS[tries - 1] || $386baf7f763905e6$var$DEFAULT_RECONNECT_FALLBACK;
        };
        switch(this.vsn){
            case 0, $14c34fa438c93719$export$b8f6d7e635d6c56b:
                this.encode = (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : (payload, callback)=>{
                    return callback(JSON.stringify(payload));
                };
                this.decode = (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : (payload, callback)=>{
                    return callback(JSON.parse(payload));
                };
                break;
            case 0, $14c34fa438c93719$export$3f251ec2d5d5cd3a:
                this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
                this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
                break;
            default:
                throw new Error(`Unsupported serializer version: ${this.vsn}`);
        }
        // Handle worker setup
        if (this.worker) {
            if (typeof window !== 'undefined' && !window.Worker) throw new Error('Web Worker is not supported');
            this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
    }
}







// src/errors/IcebergError.ts
var $7df3d3e5727cc2ac$export$5625de1fddd06f76 = class extends Error {
    constructor(message, opts){
        super(message);
        this.name = "IcebergError";
        this.status = opts.status;
        this.icebergType = opts.icebergType;
        this.icebergCode = opts.icebergCode;
        this.details = opts.details;
        this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [
            500,
            502,
            504
        ].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
    }
    /**
   * Returns true if the error is a 404 Not Found error.
   */ isNotFound() {
        return this.status === 404;
    }
    /**
   * Returns true if the error is a 409 Conflict error.
   */ isConflict() {
        return this.status === 409;
    }
    /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */ isAuthenticationTimeout() {
        return this.status === 419;
    }
};
// src/utils/url.ts
function $7df3d3e5727cc2ac$var$buildUrl(baseUrl, path, query) {
    const url = new URL(path, baseUrl);
    if (query) {
        for (const [key, value] of Object.entries(query))if (value !== void 0) url.searchParams.set(key, value);
    }
    return url.toString();
}
// src/http/createFetchClient.ts
async function $7df3d3e5727cc2ac$var$buildAuthHeaders(auth) {
    if (!auth || auth.type === "none") return {};
    if (auth.type === "bearer") return {
        Authorization: `Bearer ${auth.token}`
    };
    if (auth.type === "header") return {
        [auth.name]: auth.value
    };
    if (auth.type === "custom") return await auth.getHeaders();
    return {};
}
function $7df3d3e5727cc2ac$var$createFetchClient(options) {
    const fetchFn = options.fetchImpl ?? globalThis.fetch;
    return {
        async request ({ method: method, path: path, query: query, body: body, headers: headers }) {
            const url = $7df3d3e5727cc2ac$var$buildUrl(options.baseUrl, path, query);
            const authHeaders = await $7df3d3e5727cc2ac$var$buildAuthHeaders(options.auth);
            const res = await fetchFn(url, {
                method: method,
                headers: {
                    ...body ? {
                        "Content-Type": "application/json"
                    } : {},
                    ...authHeaders,
                    ...headers
                },
                body: body ? JSON.stringify(body) : void 0
            });
            const text = await res.text();
            const isJson = (res.headers.get("content-type") || "").includes("application/json");
            const data = isJson && text ? JSON.parse(text) : text;
            if (!res.ok) {
                const errBody = isJson ? data : void 0;
                const errorDetail = errBody?.error;
                throw new $7df3d3e5727cc2ac$export$5625de1fddd06f76(errorDetail?.message ?? `Request failed with status ${res.status}`, {
                    status: res.status,
                    icebergType: errorDetail?.type,
                    icebergCode: errorDetail?.code,
                    details: errBody
                });
            }
            return {
                status: res.status,
                headers: res.headers,
                data: data
            };
        }
    };
}
// src/catalog/namespaces.ts
function $7df3d3e5727cc2ac$var$namespaceToPath(namespace) {
    return namespace.join("");
}
var $7df3d3e5727cc2ac$var$NamespaceOperations = class {
    constructor(client, prefix = ""){
        this.client = client;
        this.prefix = prefix;
    }
    async listNamespaces(parent) {
        const query = parent ? {
            parent: $7df3d3e5727cc2ac$var$namespaceToPath(parent.namespace)
        } : void 0;
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces`,
            query: query
        });
        return response.data.namespaces.map((ns)=>({
                namespace: ns
            }));
    }
    async createNamespace(id, metadata) {
        const request = {
            namespace: id.namespace,
            properties: metadata?.properties
        };
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces`,
            body: request
        });
        return response.data;
    }
    async dropNamespace(id) {
        await this.client.request({
            method: "DELETE",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath(id.namespace)}`
        });
    }
    async loadNamespaceMetadata(id) {
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath(id.namespace)}`
        });
        return {
            properties: response.data.properties
        };
    }
    async namespaceExists(id) {
        try {
            await this.client.request({
                method: "HEAD",
                path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath(id.namespace)}`
            });
            return true;
        } catch (error) {
            if (error instanceof $7df3d3e5727cc2ac$export$5625de1fddd06f76 && error.status === 404) return false;
            throw error;
        }
    }
    async createNamespaceIfNotExists(id, metadata) {
        try {
            return await this.createNamespace(id, metadata);
        } catch (error) {
            if (error instanceof $7df3d3e5727cc2ac$export$5625de1fddd06f76 && error.status === 409) return;
            throw error;
        }
    }
};
// src/catalog/tables.ts
function $7df3d3e5727cc2ac$var$namespaceToPath2(namespace) {
    return namespace.join("");
}
var $7df3d3e5727cc2ac$var$TableOperations = class {
    constructor(client, prefix = "", accessDelegation){
        this.client = client;
        this.prefix = prefix;
        this.accessDelegation = accessDelegation;
    }
    async listTables(namespace) {
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(namespace.namespace)}/tables`
        });
        return response.data.identifiers;
    }
    async createTable(namespace, request) {
        const headers = {};
        if (this.accessDelegation) headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(namespace.namespace)}/tables`,
            body: request,
            headers: headers
        });
        return response.data.metadata;
    }
    async updateTable(id, request) {
        const response = await this.client.request({
            method: "POST",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(id.namespace)}/tables/${id.name}`,
            body: request
        });
        return {
            "metadata-location": response.data["metadata-location"],
            metadata: response.data.metadata
        };
    }
    async dropTable(id, options) {
        await this.client.request({
            method: "DELETE",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(id.namespace)}/tables/${id.name}`,
            query: {
                purgeRequested: String(options?.purge ?? false)
            }
        });
    }
    async loadTable(id) {
        const headers = {};
        if (this.accessDelegation) headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        const response = await this.client.request({
            method: "GET",
            path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(id.namespace)}/tables/${id.name}`,
            headers: headers
        });
        return response.data.metadata;
    }
    async tableExists(id) {
        const headers = {};
        if (this.accessDelegation) headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
        try {
            await this.client.request({
                method: "HEAD",
                path: `${this.prefix}/namespaces/${$7df3d3e5727cc2ac$var$namespaceToPath2(id.namespace)}/tables/${id.name}`,
                headers: headers
            });
            return true;
        } catch (error) {
            if (error instanceof $7df3d3e5727cc2ac$export$5625de1fddd06f76 && error.status === 404) return false;
            throw error;
        }
    }
    async createTableIfNotExists(namespace, request) {
        try {
            return await this.createTable(namespace, request);
        } catch (error) {
            if (error instanceof $7df3d3e5727cc2ac$export$5625de1fddd06f76 && error.status === 409) return await this.loadTable({
                namespace: namespace.namespace,
                name: request.name
            });
            throw error;
        }
    }
};
// src/catalog/IcebergRestCatalog.ts
var $7df3d3e5727cc2ac$export$1ccb0cb30480e317 = class {
    /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */ constructor(options){
        let prefix = "v1";
        if (options.catalogName) prefix += `/${options.catalogName}`;
        const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
        this.client = $7df3d3e5727cc2ac$var$createFetchClient({
            baseUrl: baseUrl,
            auth: options.auth,
            fetchImpl: options.fetch
        });
        this.accessDelegation = options.accessDelegation?.join(",");
        this.namespaceOps = new $7df3d3e5727cc2ac$var$NamespaceOperations(this.client, prefix);
        this.tableOps = new $7df3d3e5727cc2ac$var$TableOperations(this.client, prefix, this.accessDelegation);
    }
    /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */ async listNamespaces(parent) {
        return this.namespaceOps.listNamespaces(parent);
    }
    /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */ async createNamespace(id, metadata) {
        return this.namespaceOps.createNamespace(id, metadata);
    }
    /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */ async dropNamespace(id) {
        await this.namespaceOps.dropNamespace(id);
    }
    /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */ async loadNamespaceMetadata(id) {
        return this.namespaceOps.loadNamespaceMetadata(id);
    }
    /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */ async listTables(namespace) {
        return this.tableOps.listTables(namespace);
    }
    /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */ async createTable(namespace, request) {
        return this.tableOps.createTable(namespace, request);
    }
    /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */ async updateTable(id, request) {
        return this.tableOps.updateTable(id, request);
    }
    /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */ async dropTable(id, options) {
        await this.tableOps.dropTable(id, options);
    }
    /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */ async loadTable(id) {
        return this.tableOps.loadTable(id);
    }
    /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */ async namespaceExists(id) {
        return this.namespaceOps.namespaceExists(id);
    }
    /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */ async tableExists(id) {
        return this.tableOps.tableExists(id);
    }
    /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */ async createNamespaceIfNotExists(id, metadata) {
        return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
    }
    /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */ async createTableIfNotExists(namespace, request) {
        return this.tableOps.createTableIfNotExists(namespace, request);
    }
};
// src/catalog/types.ts
var $7df3d3e5727cc2ac$var$DECIMAL_REGEX = /^decimal\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)$/;
var $7df3d3e5727cc2ac$var$FIXED_REGEX = /^fixed\s*\[\s*(\d+)\s*\]$/;
function $7df3d3e5727cc2ac$export$31eb975fa3e9c1f6(type) {
    const match = type.match($7df3d3e5727cc2ac$var$DECIMAL_REGEX);
    if (!match) return null;
    return {
        precision: parseInt(match[1], 10),
        scale: parseInt(match[2], 10)
    };
}
function $7df3d3e5727cc2ac$export$43d56cf6240a0c0e(type) {
    const match = type.match($7df3d3e5727cc2ac$var$FIXED_REGEX);
    if (!match) return null;
    return {
        length: parseInt(match[1], 10)
    };
}
function $7df3d3e5727cc2ac$export$ec8cf417183662a1(type) {
    return $7df3d3e5727cc2ac$var$DECIMAL_REGEX.test(type);
}
function $7df3d3e5727cc2ac$export$9fafc1fb79bd852e(type) {
    return $7df3d3e5727cc2ac$var$FIXED_REGEX.test(type);
}
function $7df3d3e5727cc2ac$export$84255940fed2ec86(a, b) {
    const decimalA = $7df3d3e5727cc2ac$export$31eb975fa3e9c1f6(a);
    const decimalB = $7df3d3e5727cc2ac$export$31eb975fa3e9c1f6(b);
    if (decimalA && decimalB) return decimalA.precision === decimalB.precision && decimalA.scale === decimalB.scale;
    const fixedA = $7df3d3e5727cc2ac$export$43d56cf6240a0c0e(a);
    const fixedB = $7df3d3e5727cc2ac$export$43d56cf6240a0c0e(b);
    if (fixedA && fixedB) return fixedA.length === fixedB.length;
    return a === b;
}
function $7df3d3e5727cc2ac$export$d26e6db8c278e564(metadata) {
    return metadata.schemas.find((s)=>s["schema-id"] === metadata["current-schema-id"]);
}
 //# sourceMappingURL=index.mjs.map


/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ /* eslint-disable no-proto */ var $aa305406dd6eb8ab$export$a143d493d941bafc;
var $aa305406dd6eb8ab$export$e4cf37d7f6fb9e0a;
var $aa305406dd6eb8ab$export$f99ded8fe4b79145;
var $aa305406dd6eb8ab$export$599f31c3813fae4d;
'use strict';
var $d107091255e5286d$export$a48f0734ac7c2329;
var $d107091255e5286d$export$d622b2ad8d90c771;
var $d107091255e5286d$export$6100ba28696e12de;
'use strict';
$d107091255e5286d$export$a48f0734ac7c2329 = $d107091255e5286d$var$byteLength;
$d107091255e5286d$export$d622b2ad8d90c771 = $d107091255e5286d$var$toByteArray;
$d107091255e5286d$export$6100ba28696e12de = $d107091255e5286d$var$fromByteArray;
var $d107091255e5286d$var$lookup = [];
var $d107091255e5286d$var$revLookup = [];
var $d107091255e5286d$var$Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var $d107091255e5286d$var$code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for(var $d107091255e5286d$var$i = 0, $d107091255e5286d$var$len = $d107091255e5286d$var$code.length; $d107091255e5286d$var$i < $d107091255e5286d$var$len; ++$d107091255e5286d$var$i){
    $d107091255e5286d$var$lookup[$d107091255e5286d$var$i] = $d107091255e5286d$var$code[$d107091255e5286d$var$i];
    $d107091255e5286d$var$revLookup[$d107091255e5286d$var$code.charCodeAt($d107091255e5286d$var$i)] = $d107091255e5286d$var$i;
}
// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
$d107091255e5286d$var$revLookup['-'.charCodeAt(0)] = 62;
$d107091255e5286d$var$revLookup['_'.charCodeAt(0)] = 63;
function $d107091255e5286d$var$getLens(b64) {
    var len = b64.length;
    if (len % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4');
    // Trim off extra bytes after placeholder bytes are found
    // See: https://github.com/beatgammit/base64-js/issues/42
    var validLen = b64.indexOf('=');
    if (validLen === -1) validLen = len;
    var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
    return [
        validLen,
        placeHoldersLen
    ];
}
// base64 is 4/3 + up to two characters of the original data
function $d107091255e5286d$var$byteLength(b64) {
    var lens = $d107091255e5286d$var$getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function $d107091255e5286d$var$_byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function $d107091255e5286d$var$toByteArray(b64) {
    var tmp;
    var lens = $d107091255e5286d$var$getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new $d107091255e5286d$var$Arr($d107091255e5286d$var$_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    // if there are placeholders, only get up to the last complete 4 chars
    var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i;
    for(i = 0; i < len; i += 4){
        tmp = $d107091255e5286d$var$revLookup[b64.charCodeAt(i)] << 18 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 1)] << 12 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 2)] << 6 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 0xFF;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 2) {
        tmp = $d107091255e5286d$var$revLookup[b64.charCodeAt(i)] << 2 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = tmp & 0xFF;
    }
    if (placeHoldersLen === 1) {
        tmp = $d107091255e5286d$var$revLookup[b64.charCodeAt(i)] << 10 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 1)] << 4 | $d107091255e5286d$var$revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }
    return arr;
}
function $d107091255e5286d$var$tripletToBase64(num) {
    return $d107091255e5286d$var$lookup[num >> 18 & 0x3F] + $d107091255e5286d$var$lookup[num >> 12 & 0x3F] + $d107091255e5286d$var$lookup[num >> 6 & 0x3F] + $d107091255e5286d$var$lookup[num & 0x3F];
}
function $d107091255e5286d$var$encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for(var i = start; i < end; i += 3){
        tmp = (uint8[i] << 16 & 0xFF0000) + (uint8[i + 1] << 8 & 0xFF00) + (uint8[i + 2] & 0xFF);
        output.push($d107091255e5286d$var$tripletToBase64(tmp));
    }
    return output.join('');
}
function $d107091255e5286d$var$fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
    ;
    var parts = [];
    var maxChunkLength = 16383 // must be multiple of 3
    ;
    // go through the array every three bytes, we'll deal with trailing stuff later
    for(var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength)parts.push($d107091255e5286d$var$encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
        tmp = uint8[len - 1];
        parts.push($d107091255e5286d$var$lookup[tmp >> 2] + $d107091255e5286d$var$lookup[tmp << 4 & 0x3F] + '==');
    } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push($d107091255e5286d$var$lookup[tmp >> 10] + $d107091255e5286d$var$lookup[tmp >> 4 & 0x3F] + $d107091255e5286d$var$lookup[tmp << 2 & 0x3F] + '=');
    }
    return parts.join('');
}


/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ var $4c3041a17f3998af$export$aafa59e2e03f2942;
var $4c3041a17f3998af$export$68d8715fc104d294;
$4c3041a17f3998af$export$aafa59e2e03f2942 = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for(; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for(; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);
    if (e === 0) e = 1 - eBias;
    else if (e === eMax) return m ? NaN : (s ? -1 : 1) * Infinity;
    else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};
$4c3041a17f3998af$export$68d8715fc104d294 = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
    } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
        }
        if (e + eBias >= 1) value += rt / c;
        else value += rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
            e++;
            c /= 2;
        }
        if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
        } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
        } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
        }
    }
    for(; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);
    e = e << mLen | m;
    eLen += mLen;
    for(; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);
    buffer[offset + i - d] |= s * 128;
};


const $aa305406dd6eb8ab$var$customInspectSymbol = typeof Symbol === 'function' && typeof Symbol['for'] === 'function' // eslint-disable-line dot-notation
 ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
 : null;
$aa305406dd6eb8ab$export$a143d493d941bafc = $aa305406dd6eb8ab$var$Buffer;
$aa305406dd6eb8ab$export$e4cf37d7f6fb9e0a = $aa305406dd6eb8ab$var$SlowBuffer;
$aa305406dd6eb8ab$export$f99ded8fe4b79145 = 50;
const $aa305406dd6eb8ab$var$K_MAX_LENGTH = 0x7fffffff;
$aa305406dd6eb8ab$export$599f31c3813fae4d = $aa305406dd6eb8ab$var$K_MAX_LENGTH;
/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */ $aa305406dd6eb8ab$var$Buffer.TYPED_ARRAY_SUPPORT = $aa305406dd6eb8ab$var$typedArraySupport();
if (!$aa305406dd6eb8ab$var$Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
function $aa305406dd6eb8ab$var$typedArraySupport() {
    // Can typed array instances can be augmented?
    try {
        const arr = new Uint8Array(1);
        const proto = {
            foo: function() {
                return 42;
            }
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
    } catch (e) {
        return false;
    }
}
Object.defineProperty($aa305406dd6eb8ab$var$Buffer.prototype, 'parent', {
    enumerable: true,
    get: function() {
        if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(this)) return undefined;
        return this.buffer;
    }
});
Object.defineProperty($aa305406dd6eb8ab$var$Buffer.prototype, 'offset', {
    enumerable: true,
    get: function() {
        if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(this)) return undefined;
        return this.byteOffset;
    }
});
function $aa305406dd6eb8ab$var$createBuffer(length) {
    if (length > $aa305406dd6eb8ab$var$K_MAX_LENGTH) throw new RangeError('The value "' + length + '" is invalid for option "size"');
    // Return an augmented `Uint8Array` instance
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, $aa305406dd6eb8ab$var$Buffer.prototype);
    return buf;
}
/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */ function $aa305406dd6eb8ab$var$Buffer(arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') throw new TypeError('The "string" argument must be of type string. Received type number');
        return $aa305406dd6eb8ab$var$allocUnsafe(arg);
    }
    return $aa305406dd6eb8ab$var$from(arg, encodingOrOffset, length);
}
$aa305406dd6eb8ab$var$Buffer.poolSize = 8192 // not used by this implementation
;
function $aa305406dd6eb8ab$var$from(value, encodingOrOffset, length) {
    if (typeof value === 'string') return $aa305406dd6eb8ab$var$fromString(value, encodingOrOffset);
    if (ArrayBuffer.isView(value)) return $aa305406dd6eb8ab$var$fromArrayView(value);
    if (value == null) throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    if ($aa305406dd6eb8ab$var$isInstance(value, ArrayBuffer) || value && $aa305406dd6eb8ab$var$isInstance(value.buffer, ArrayBuffer)) return $aa305406dd6eb8ab$var$fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof SharedArrayBuffer !== 'undefined' && ($aa305406dd6eb8ab$var$isInstance(value, SharedArrayBuffer) || value && $aa305406dd6eb8ab$var$isInstance(value.buffer, SharedArrayBuffer))) return $aa305406dd6eb8ab$var$fromArrayBuffer(value, encodingOrOffset, length);
    if (typeof value === 'number') throw new TypeError('The "value" argument must not be of type number. Received type number');
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) return $aa305406dd6eb8ab$var$Buffer.from(valueOf, encodingOrOffset, length);
    const b = $aa305406dd6eb8ab$var$fromObject(value);
    if (b) return b;
    if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === 'function') return $aa305406dd6eb8ab$var$Buffer.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length);
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
}
/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/ $aa305406dd6eb8ab$var$Buffer.from = function(value, encodingOrOffset, length) {
    return $aa305406dd6eb8ab$var$from(value, encodingOrOffset, length);
};
// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Object.setPrototypeOf($aa305406dd6eb8ab$var$Buffer.prototype, Uint8Array.prototype);
Object.setPrototypeOf($aa305406dd6eb8ab$var$Buffer, Uint8Array);
function $aa305406dd6eb8ab$var$assertSize(size) {
    if (typeof size !== 'number') throw new TypeError('"size" argument must be of type number');
    else if (size < 0) throw new RangeError('The value "' + size + '" is invalid for option "size"');
}
function $aa305406dd6eb8ab$var$alloc(size, fill, encoding) {
    $aa305406dd6eb8ab$var$assertSize(size);
    if (size <= 0) return $aa305406dd6eb8ab$var$createBuffer(size);
    if (fill !== undefined) // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpreted as a start offset.
    return typeof encoding === 'string' ? $aa305406dd6eb8ab$var$createBuffer(size).fill(fill, encoding) : $aa305406dd6eb8ab$var$createBuffer(size).fill(fill);
    return $aa305406dd6eb8ab$var$createBuffer(size);
}
/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/ $aa305406dd6eb8ab$var$Buffer.alloc = function(size, fill, encoding) {
    return $aa305406dd6eb8ab$var$alloc(size, fill, encoding);
};
function $aa305406dd6eb8ab$var$allocUnsafe(size) {
    $aa305406dd6eb8ab$var$assertSize(size);
    return $aa305406dd6eb8ab$var$createBuffer(size < 0 ? 0 : $aa305406dd6eb8ab$var$checked(size) | 0);
}
/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */ $aa305406dd6eb8ab$var$Buffer.allocUnsafe = function(size) {
    return $aa305406dd6eb8ab$var$allocUnsafe(size);
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */ $aa305406dd6eb8ab$var$Buffer.allocUnsafeSlow = function(size) {
    return $aa305406dd6eb8ab$var$allocUnsafe(size);
};
function $aa305406dd6eb8ab$var$fromString(string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8';
    if (!$aa305406dd6eb8ab$var$Buffer.isEncoding(encoding)) throw new TypeError('Unknown encoding: ' + encoding);
    const length = $aa305406dd6eb8ab$var$byteLength(string, encoding) | 0;
    let buf = $aa305406dd6eb8ab$var$createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual);
    return buf;
}
function $aa305406dd6eb8ab$var$fromArrayLike(array) {
    const length = array.length < 0 ? 0 : $aa305406dd6eb8ab$var$checked(array.length) | 0;
    const buf = $aa305406dd6eb8ab$var$createBuffer(length);
    for(let i = 0; i < length; i += 1)buf[i] = array[i] & 255;
    return buf;
}
function $aa305406dd6eb8ab$var$fromArrayView(arrayView) {
    if ($aa305406dd6eb8ab$var$isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return $aa305406dd6eb8ab$var$fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return $aa305406dd6eb8ab$var$fromArrayLike(arrayView);
}
function $aa305406dd6eb8ab$var$fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError('"offset" is outside of buffer bounds');
    if (array.byteLength < byteOffset + (length || 0)) throw new RangeError('"length" is outside of buffer bounds');
    let buf;
    if (byteOffset === undefined && length === undefined) buf = new Uint8Array(array);
    else if (length === undefined) buf = new Uint8Array(array, byteOffset);
    else buf = new Uint8Array(array, byteOffset, length);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(buf, $aa305406dd6eb8ab$var$Buffer.prototype);
    return buf;
}
function $aa305406dd6eb8ab$var$fromObject(obj) {
    if ($aa305406dd6eb8ab$var$Buffer.isBuffer(obj)) {
        const len = $aa305406dd6eb8ab$var$checked(obj.length) | 0;
        const buf = $aa305406dd6eb8ab$var$createBuffer(len);
        if (buf.length === 0) return buf;
        obj.copy(buf, 0, 0, len);
        return buf;
    }
    if (obj.length !== undefined) {
        if (typeof obj.length !== 'number' || $aa305406dd6eb8ab$var$numberIsNaN(obj.length)) return $aa305406dd6eb8ab$var$createBuffer(0);
        return $aa305406dd6eb8ab$var$fromArrayLike(obj);
    }
    if (obj.type === 'Buffer' && Array.isArray(obj.data)) return $aa305406dd6eb8ab$var$fromArrayLike(obj.data);
}
function $aa305406dd6eb8ab$var$checked(length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= $aa305406dd6eb8ab$var$K_MAX_LENGTH) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + $aa305406dd6eb8ab$var$K_MAX_LENGTH.toString(16) + ' bytes');
    return length | 0;
}
function $aa305406dd6eb8ab$var$SlowBuffer(length) {
    if (+length != length) length = 0;
    return $aa305406dd6eb8ab$var$Buffer.alloc(+length);
}
$aa305406dd6eb8ab$var$Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== $aa305406dd6eb8ab$var$Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
    ;
};
$aa305406dd6eb8ab$var$Buffer.compare = function compare(a, b) {
    if ($aa305406dd6eb8ab$var$isInstance(a, Uint8Array)) a = $aa305406dd6eb8ab$var$Buffer.from(a, a.offset, a.byteLength);
    if ($aa305406dd6eb8ab$var$isInstance(b, Uint8Array)) b = $aa305406dd6eb8ab$var$Buffer.from(b, b.offset, b.byteLength);
    if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(a) || !$aa305406dd6eb8ab$var$Buffer.isBuffer(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    if (a === b) return 0;
    let x = a.length;
    let y = b.length;
    for(let i = 0, len = Math.min(x, y); i < len; ++i)if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
$aa305406dd6eb8ab$var$Buffer.isEncoding = function isEncoding(encoding) {
    switch(String(encoding).toLowerCase()){
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return true;
        default:
            return false;
    }
};
$aa305406dd6eb8ab$var$Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (list.length === 0) return $aa305406dd6eb8ab$var$Buffer.alloc(0);
    let i;
    if (length === undefined) {
        length = 0;
        for(i = 0; i < list.length; ++i)length += list[i].length;
    }
    const buffer = $aa305406dd6eb8ab$var$Buffer.allocUnsafe(length);
    let pos = 0;
    for(i = 0; i < list.length; ++i){
        let buf = list[i];
        if ($aa305406dd6eb8ab$var$isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
                if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(buf)) buf = $aa305406dd6eb8ab$var$Buffer.from(buf);
                buf.copy(buffer, pos);
            } else Uint8Array.prototype.set.call(buffer, buf, pos);
        } else if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
        else buf.copy(buffer, pos);
        pos += buf.length;
    }
    return buffer;
};
function $aa305406dd6eb8ab$var$byteLength(string, encoding) {
    if ($aa305406dd6eb8ab$var$Buffer.isBuffer(string)) return string.length;
    if (ArrayBuffer.isView(string) || $aa305406dd6eb8ab$var$isInstance(string, ArrayBuffer)) return string.byteLength;
    if (typeof string !== 'string') throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    const len = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0) return 0;
    // Use a for loop to avoid recursion
    let loweredCase = false;
    for(;;)switch(encoding){
        case 'ascii':
        case 'latin1':
        case 'binary':
            return len;
        case 'utf8':
        case 'utf-8':
            return $aa305406dd6eb8ab$var$utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return len * 2;
        case 'hex':
            return len >>> 1;
        case 'base64':
            return $aa305406dd6eb8ab$var$base64ToBytes(string).length;
        default:
            if (loweredCase) return mustMatch ? -1 : $aa305406dd6eb8ab$var$utf8ToBytes(string).length // assume utf8
            ;
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
    }
}
$aa305406dd6eb8ab$var$Buffer.byteLength = $aa305406dd6eb8ab$var$byteLength;
function $aa305406dd6eb8ab$var$slowToString(encoding, start, end) {
    let loweredCase = false;
    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.
    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) start = 0;
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) return '';
    if (end === undefined || end > this.length) end = this.length;
    if (end <= 0) return '';
    // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;
    if (end <= start) return '';
    if (!encoding) encoding = 'utf8';
    while(true)switch(encoding){
        case 'hex':
            return $aa305406dd6eb8ab$var$hexSlice(this, start, end);
        case 'utf8':
        case 'utf-8':
            return $aa305406dd6eb8ab$var$utf8Slice(this, start, end);
        case 'ascii':
            return $aa305406dd6eb8ab$var$asciiSlice(this, start, end);
        case 'latin1':
        case 'binary':
            return $aa305406dd6eb8ab$var$latin1Slice(this, start, end);
        case 'base64':
            return $aa305406dd6eb8ab$var$base64Slice(this, start, end);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return $aa305406dd6eb8ab$var$utf16leSlice(this, start, end);
        default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
            encoding = (encoding + '').toLowerCase();
            loweredCase = true;
    }
}
// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
$aa305406dd6eb8ab$var$Buffer.prototype._isBuffer = true;
function $aa305406dd6eb8ab$var$swap(b, n, m) {
    const i = b[n];
    b[n] = b[m];
    b[m] = i;
}
$aa305406dd6eb8ab$var$Buffer.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits');
    for(let i = 0; i < len; i += 2)$aa305406dd6eb8ab$var$swap(this, i, i + 1);
    return this;
};
$aa305406dd6eb8ab$var$Buffer.prototype.swap32 = function swap32() {
    const len = this.length;
    if (len % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits');
    for(let i = 0; i < len; i += 4){
        $aa305406dd6eb8ab$var$swap(this, i, i + 3);
        $aa305406dd6eb8ab$var$swap(this, i + 1, i + 2);
    }
    return this;
};
$aa305406dd6eb8ab$var$Buffer.prototype.swap64 = function swap64() {
    const len = this.length;
    if (len % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits');
    for(let i = 0; i < len; i += 8){
        $aa305406dd6eb8ab$var$swap(this, i, i + 7);
        $aa305406dd6eb8ab$var$swap(this, i + 1, i + 6);
        $aa305406dd6eb8ab$var$swap(this, i + 2, i + 5);
        $aa305406dd6eb8ab$var$swap(this, i + 3, i + 4);
    }
    return this;
};
$aa305406dd6eb8ab$var$Buffer.prototype.toString = function toString() {
    const length = this.length;
    if (length === 0) return '';
    if (arguments.length === 0) return $aa305406dd6eb8ab$var$utf8Slice(this, 0, length);
    return $aa305406dd6eb8ab$var$slowToString.apply(this, arguments);
};
$aa305406dd6eb8ab$var$Buffer.prototype.toLocaleString = $aa305406dd6eb8ab$var$Buffer.prototype.toString;
$aa305406dd6eb8ab$var$Buffer.prototype.equals = function equals(b) {
    if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
    if (this === b) return true;
    return $aa305406dd6eb8ab$var$Buffer.compare(this, b) === 0;
};
$aa305406dd6eb8ab$var$Buffer.prototype.inspect = function inspect() {
    let str = '';
    const max = $aa305406dd6eb8ab$export$f99ded8fe4b79145;
    str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim();
    if (this.length > max) str += ' ... ';
    return '<Buffer ' + str + '>';
};
if ($aa305406dd6eb8ab$var$customInspectSymbol) $aa305406dd6eb8ab$var$Buffer.prototype[$aa305406dd6eb8ab$var$customInspectSymbol] = $aa305406dd6eb8ab$var$Buffer.prototype.inspect;
$aa305406dd6eb8ab$var$Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if ($aa305406dd6eb8ab$var$isInstance(target, Uint8Array)) target = $aa305406dd6eb8ab$var$Buffer.from(target, target.offset, target.byteLength);
    if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(target)) throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    if (start === undefined) start = 0;
    if (end === undefined) end = target ? target.length : 0;
    if (thisStart === undefined) thisStart = 0;
    if (thisEnd === undefined) thisEnd = this.length;
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError('out of range index');
    if (thisStart >= thisEnd && start >= end) return 0;
    if (thisStart >= thisEnd) return -1;
    if (start >= end) return 1;
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target) return 0;
    let x = thisEnd - thisStart;
    let y = end - start;
    const len = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for(let i = 0; i < len; ++i)if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
    }
    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
};
// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function $aa305406dd6eb8ab$var$bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1;
    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
        encoding = byteOffset;
        byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff;
    else if (byteOffset < -2147483648) byteOffset = -2147483648;
    byteOffset = +byteOffset // Coerce to Number.
    ;
    if ($aa305406dd6eb8ab$var$numberIsNaN(byteOffset)) // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : buffer.length - 1;
    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
    }
    // Normalize val
    if (typeof val === 'string') val = $aa305406dd6eb8ab$var$Buffer.from(val, encoding);
    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if ($aa305406dd6eb8ab$var$Buffer.isBuffer(val)) {
        // Special case: looking for empty string/buffer always fails
        if (val.length === 0) return -1;
        return $aa305406dd6eb8ab$var$arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === 'number') {
        val = val & 0xFF // Search for a byte value [0-255]
        ;
        if (typeof Uint8Array.prototype.indexOf === 'function') {
            if (dir) return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            else return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
        return $aa305406dd6eb8ab$var$arrayIndexOf(buffer, [
            val
        ], byteOffset, encoding, dir);
    }
    throw new TypeError('val must be string, number or Buffer');
}
function $aa305406dd6eb8ab$var$arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== undefined) {
        encoding = String(encoding).toLowerCase();
        if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
        }
    }
    function read(buf, i) {
        if (indexSize === 1) return buf[i];
        else return buf.readUInt16BE(i * indexSize);
    }
    let i;
    if (dir) {
        let foundIndex = -1;
        for(i = byteOffset; i < arrLength; i++)if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
        }
    } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for(i = byteOffset; i >= 0; i--){
            let found = true;
            for(let j = 0; j < valLength; j++)if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
            }
            if (found) return i;
        }
    }
    return -1;
}
$aa305406dd6eb8ab$var$Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
};
$aa305406dd6eb8ab$var$Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return $aa305406dd6eb8ab$var$bidirectionalIndexOf(this, val, byteOffset, encoding, true);
};
$aa305406dd6eb8ab$var$Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return $aa305406dd6eb8ab$var$bidirectionalIndexOf(this, val, byteOffset, encoding, false);
};
function $aa305406dd6eb8ab$var$hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) length = remaining;
    else {
        length = Number(length);
        if (length > remaining) length = remaining;
    }
    const strLen = string.length;
    if (length > strLen / 2) length = strLen / 2;
    let i;
    for(i = 0; i < length; ++i){
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if ($aa305406dd6eb8ab$var$numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
    }
    return i;
}
function $aa305406dd6eb8ab$var$utf8Write(buf, string, offset, length) {
    return $aa305406dd6eb8ab$var$blitBuffer($aa305406dd6eb8ab$var$utf8ToBytes(string, buf.length - offset), buf, offset, length);
}
function $aa305406dd6eb8ab$var$asciiWrite(buf, string, offset, length) {
    return $aa305406dd6eb8ab$var$blitBuffer($aa305406dd6eb8ab$var$asciiToBytes(string), buf, offset, length);
}
function $aa305406dd6eb8ab$var$base64Write(buf, string, offset, length) {
    return $aa305406dd6eb8ab$var$blitBuffer($aa305406dd6eb8ab$var$base64ToBytes(string), buf, offset, length);
}
function $aa305406dd6eb8ab$var$ucs2Write(buf, string, offset, length) {
    return $aa305406dd6eb8ab$var$blitBuffer($aa305406dd6eb8ab$var$utf16leToBytes(string, buf.length - offset), buf, offset, length);
}
$aa305406dd6eb8ab$var$Buffer.prototype.write = function write(string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
        encoding = 'utf8';
        length = this.length;
        offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
        encoding = offset;
        length = this.length;
        offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === undefined) encoding = 'utf8';
        } else {
            encoding = length;
            length = undefined;
        }
    } else throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
    const remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError('Attempt to write outside buffer bounds');
    if (!encoding) encoding = 'utf8';
    let loweredCase = false;
    for(;;)switch(encoding){
        case 'hex':
            return $aa305406dd6eb8ab$var$hexWrite(this, string, offset, length);
        case 'utf8':
        case 'utf-8':
            return $aa305406dd6eb8ab$var$utf8Write(this, string, offset, length);
        case 'ascii':
        case 'latin1':
        case 'binary':
            return $aa305406dd6eb8ab$var$asciiWrite(this, string, offset, length);
        case 'base64':
            // Warning: maxLength not taken into account in base64Write
            return $aa305406dd6eb8ab$var$base64Write(this, string, offset, length);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
            return $aa305406dd6eb8ab$var$ucs2Write(this, string, offset, length);
        default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
            encoding = ('' + encoding).toLowerCase();
            loweredCase = true;
    }
};
$aa305406dd6eb8ab$var$Buffer.prototype.toJSON = function toJSON() {
    return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
function $aa305406dd6eb8ab$var$base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) return $d107091255e5286d$export$6100ba28696e12de(buf);
    else return $d107091255e5286d$export$6100ba28696e12de(buf.slice(start, end));
}
function $aa305406dd6eb8ab$var$utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i = start;
    while(i < end){
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;
        if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 0x80) codePoint = firstByte;
                    break;
                case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
                        if (tempCodePoint > 0x7F) codePoint = tempCodePoint;
                    }
                    break;
                case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) codePoint = tempCodePoint;
                    }
                    break;
                case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) codePoint = tempCodePoint;
                    }
            }
        }
        if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD;
            bytesPerSequence = 1;
        } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000;
            res.push(codePoint >>> 10 & 0x3FF | 0xD800);
            codePoint = 0xDC00 | codePoint & 0x3FF;
        }
        res.push(codePoint);
        i += bytesPerSequence;
    }
    return $aa305406dd6eb8ab$var$decodeCodePointsArray(res);
}
// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
const $aa305406dd6eb8ab$var$MAX_ARGUMENTS_LENGTH = 0x1000;
function $aa305406dd6eb8ab$var$decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= $aa305406dd6eb8ab$var$MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    ;
    // Decode in chunks to avoid "call stack size exceeded".
    let res = '';
    let i = 0;
    while(i < len)res += String.fromCharCode.apply(String, codePoints.slice(i, i += $aa305406dd6eb8ab$var$MAX_ARGUMENTS_LENGTH));
    return res;
}
function $aa305406dd6eb8ab$var$asciiSlice(buf, start, end) {
    let ret = '';
    end = Math.min(buf.length, end);
    for(let i = start; i < end; ++i)ret += String.fromCharCode(buf[i] & 0x7F);
    return ret;
}
function $aa305406dd6eb8ab$var$latin1Slice(buf, start, end) {
    let ret = '';
    end = Math.min(buf.length, end);
    for(let i = start; i < end; ++i)ret += String.fromCharCode(buf[i]);
    return ret;
}
function $aa305406dd6eb8ab$var$hexSlice(buf, start, end) {
    const len = buf.length;
    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;
    let out = '';
    for(let i = start; i < end; ++i)out += $aa305406dd6eb8ab$var$hexSliceLookupTable[buf[i]];
    return out;
}
function $aa305406dd6eb8ab$var$utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = '';
    // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
    for(let i = 0; i < bytes.length - 1; i += 2)res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    return res;
}
$aa305406dd6eb8ab$var$Buffer.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
        start += len;
        if (start < 0) start = 0;
    } else if (start > len) start = len;
    if (end < 0) {
        end += len;
        if (end < 0) end = 0;
    } else if (end > len) end = len;
    if (end < start) end = start;
    const newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    Object.setPrototypeOf(newBuf, $aa305406dd6eb8ab$var$Buffer.prototype);
    return newBuf;
};
/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */ function $aa305406dd6eb8ab$var$checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
}
$aa305406dd6eb8ab$var$Buffer.prototype.readUintLE = $aa305406dd6eb8ab$var$Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while(++i < byteLength && (mul *= 0x100))val += this[offset + i] * mul;
    return val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUintBE = $aa305406dd6eb8ab$var$Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset + --byteLength];
    let mul = 1;
    while(byteLength > 0 && (mul *= 0x100))val += this[offset + --byteLength] * mul;
    return val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUint8 = $aa305406dd6eb8ab$var$Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 1, this.length);
    return this[offset];
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUint16LE = $aa305406dd6eb8ab$var$Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUint16BE = $aa305406dd6eb8ab$var$Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUint32LE = $aa305406dd6eb8ab$var$Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readUint32BE = $aa305406dd6eb8ab$var$Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
};
$aa305406dd6eb8ab$var$Buffer.prototype.readBigUInt64LE = $aa305406dd6eb8ab$var$defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    $aa305406dd6eb8ab$var$validateNumber(offset, 'offset');
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $aa305406dd6eb8ab$var$boundsError(offset, this.length - 8);
    const lo = first + this[++offset] * 256 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 256 + this[++offset] * 2 ** 16 + last * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
});
$aa305406dd6eb8ab$var$Buffer.prototype.readBigUInt64BE = $aa305406dd6eb8ab$var$defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    $aa305406dd6eb8ab$var$validateNumber(offset, 'offset');
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $aa305406dd6eb8ab$var$boundsError(offset, this.length - 8);
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
});
$aa305406dd6eb8ab$var$Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, byteLength, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while(++i < byteLength && (mul *= 0x100))val += this[offset + i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, byteLength, this.length);
    let i = byteLength;
    let mul = 1;
    let val = this[offset + --i];
    while(i > 0 && (mul *= 0x100))val += this[offset + --i] * mul;
    mul *= 0x80;
    if (val >= mul) val -= Math.pow(2, 8 * byteLength);
    return val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return this[offset];
    return (0xff - this[offset] + 1) * -1;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
};
$aa305406dd6eb8ab$var$Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
};
$aa305406dd6eb8ab$var$Buffer.prototype.readBigInt64LE = $aa305406dd6eb8ab$var$defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    $aa305406dd6eb8ab$var$validateNumber(offset, 'offset');
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $aa305406dd6eb8ab$var$boundsError(offset, this.length - 8);
    const val = this[offset + 4] + this[offset + 5] * 256 + this[offset + 6] * 2 ** 16 + (last << 24 // Overflow
    );
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 256 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
});
$aa305406dd6eb8ab$var$Buffer.prototype.readBigInt64BE = $aa305406dd6eb8ab$var$defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    $aa305406dd6eb8ab$var$validateNumber(offset, 'offset');
    const first = this[offset];
    const last = this[offset + 7];
    if (first === undefined || last === undefined) $aa305406dd6eb8ab$var$boundsError(offset, this.length - 8);
    const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 + this[++offset] * 256 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 256 + last);
});
$aa305406dd6eb8ab$var$Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return $4c3041a17f3998af$export$aafa59e2e03f2942(this, offset, true, 23, 4);
};
$aa305406dd6eb8ab$var$Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 4, this.length);
    return $4c3041a17f3998af$export$aafa59e2e03f2942(this, offset, false, 23, 4);
};
$aa305406dd6eb8ab$var$Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 8, this.length);
    return $4c3041a17f3998af$export$aafa59e2e03f2942(this, offset, true, 52, 8);
};
$aa305406dd6eb8ab$var$Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkOffset(offset, 8, this.length);
    return $4c3041a17f3998af$export$aafa59e2e03f2942(this, offset, false, 52, 8);
};
function $aa305406dd6eb8ab$var$checkInt(buf, value, offset, ext, max, min) {
    if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
}
$aa305406dd6eb8ab$var$Buffer.prototype.writeUintLE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength) - 1;
        $aa305406dd6eb8ab$var$checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    let mul = 1;
    let i = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUintBE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength) - 1;
        $aa305406dd6eb8ab$var$checkInt(this, value, offset, byteLength, maxBytes, 0);
    }
    let i = byteLength - 1;
    let mul = 1;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100))this[offset + i] = value / mul & 0xFF;
    return offset + byteLength;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUint8 = $aa305406dd6eb8ab$var$Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = value & 0xff;
    return offset + 1;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUint16LE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUint16BE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUint32LE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
    return offset + 4;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeUint32BE = $aa305406dd6eb8ab$var$Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
function $aa305406dd6eb8ab$var$wrtBigUInt64LE(buf, value, offset, min, max) {
    $aa305406dd6eb8ab$var$checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(0xffffffff));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
}
function $aa305406dd6eb8ab$var$wrtBigUInt64BE(buf, value, offset, min, max) {
    $aa305406dd6eb8ab$var$checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(0xffffffff));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(0xffffffff));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
}
$aa305406dd6eb8ab$var$Buffer.prototype.writeBigUInt64LE = $aa305406dd6eb8ab$var$defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return $aa305406dd6eb8ab$var$wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});
$aa305406dd6eb8ab$var$Buffer.prototype.writeBigUInt64BE = $aa305406dd6eb8ab$var$defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return $aa305406dd6eb8ab$var$wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'));
});
$aa305406dd6eb8ab$var$Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength - 1);
        $aa305406dd6eb8ab$var$checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    let i = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 0xFF;
    while(++i < byteLength && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength - 1);
        $aa305406dd6eb8ab$var$checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    let i = byteLength - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i] = value & 0xFF;
    while(--i >= 0 && (mul *= 0x100)){
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) sub = 1;
        this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 1, 0x7f, -128);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = value & 0xff;
    return offset + 1;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 2, 0x7fff, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkInt(this, value, offset, 4, 0x7fffffff, -2147483648);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeBigInt64LE = $aa305406dd6eb8ab$var$defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return $aa305406dd6eb8ab$var$wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});
$aa305406dd6eb8ab$var$Buffer.prototype.writeBigInt64BE = $aa305406dd6eb8ab$var$defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return $aa305406dd6eb8ab$var$wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'));
});
function $aa305406dd6eb8ab$var$checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
    if (offset < 0) throw new RangeError('Index out of range');
}
function $aa305406dd6eb8ab$var$writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -340282346638528860000000000000000000000);
    $4c3041a17f3998af$export$68d8715fc104d294(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
}
$aa305406dd6eb8ab$var$Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return $aa305406dd6eb8ab$var$writeFloat(this, value, offset, true, noAssert);
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return $aa305406dd6eb8ab$var$writeFloat(this, value, offset, false, noAssert);
};
function $aa305406dd6eb8ab$var$writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) $aa305406dd6eb8ab$var$checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -179769313486231570000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000);
    $4c3041a17f3998af$export$68d8715fc104d294(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
}
$aa305406dd6eb8ab$var$Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return $aa305406dd6eb8ab$var$writeDouble(this, value, offset, true, noAssert);
};
$aa305406dd6eb8ab$var$Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return $aa305406dd6eb8ab$var$writeDouble(this, value, offset, false, noAssert);
};
// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
$aa305406dd6eb8ab$var$Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!$aa305406dd6eb8ab$var$Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;
    // Copy 0 bytes; we're done
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;
    // Fatal error conditions
    if (targetStart < 0) throw new RangeError('targetStart out of bounds');
    if (start < 0 || start >= this.length) throw new RangeError('Index out of range');
    if (end < 0) throw new RangeError('sourceEnd out of bounds');
    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) end = target.length - targetStart + start;
    const len = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end);
    else Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    return len;
};
// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
$aa305406dd6eb8ab$var$Buffer.prototype.fill = function fill(val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
        if (typeof start === 'string') {
            encoding = start;
            start = 0;
            end = this.length;
        } else if (typeof end === 'string') {
            encoding = end;
            end = this.length;
        }
        if (encoding !== undefined && typeof encoding !== 'string') throw new TypeError('encoding must be a string');
        if (typeof encoding === 'string' && !$aa305406dd6eb8ab$var$Buffer.isEncoding(encoding)) throw new TypeError('Unknown encoding: ' + encoding);
        if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === 'utf8' && code < 128 || encoding === 'latin1') // Fast path: If `val` fits into a single byte, use that numeric value.
            val = code;
        }
    } else if (typeof val === 'number') val = val & 255;
    else if (typeof val === 'boolean') val = Number(val);
    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) throw new RangeError('Out of range index');
    if (end <= start) return this;
    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;
    if (!val) val = 0;
    let i;
    if (typeof val === 'number') for(i = start; i < end; ++i)this[i] = val;
    else {
        const bytes = $aa305406dd6eb8ab$var$Buffer.isBuffer(val) ? val : $aa305406dd6eb8ab$var$Buffer.from(val, encoding);
        const len = bytes.length;
        if (len === 0) throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        for(i = 0; i < end - start; ++i)this[i + start] = bytes[i % len];
    }
    return this;
};
// CUSTOM ERRORS
// =============
// Simplified versions from Node, changed for Buffer-only usage
const $aa305406dd6eb8ab$var$errors = {};
function $aa305406dd6eb8ab$var$E(sym, getMessage, Base) {
    $aa305406dd6eb8ab$var$errors[sym] = class NodeError extends Base {
        constructor(){
            super();
            Object.defineProperty(this, 'message', {
                value: getMessage.apply(this, arguments),
                writable: true,
                configurable: true
            });
            // Add the error code to the name to include it in the stack trace.
            this.name = `${this.name} [${sym}]`;
            // Access the stack to generate the error message including the error code
            // from the name.
            this.stack // eslint-disable-line no-unused-expressions
            ;
            // Reset the name to the actual name.
            delete this.name;
        }
        get code() {
            return sym;
        }
        set code(value) {
            Object.defineProperty(this, 'code', {
                configurable: true,
                enumerable: true,
                value: value,
                writable: true
            });
        }
        toString() {
            return `${this.name} [${sym}]: ${this.message}`;
        }
    };
}
$aa305406dd6eb8ab$var$E('ERR_BUFFER_OUT_OF_BOUNDS', function(name) {
    if (name) return `${name} is outside of buffer bounds`;
    return 'Attempt to access memory outside buffer bounds';
}, RangeError);
$aa305406dd6eb8ab$var$E('ERR_INVALID_ARG_TYPE', function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
}, TypeError);
$aa305406dd6eb8ab$var$E('ERR_OUT_OF_RANGE', function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`;
    let received = input;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) received = $aa305406dd6eb8ab$var$addNumericalSeparator(String(input));
    else if (typeof input === 'bigint') {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) received = $aa305406dd6eb8ab$var$addNumericalSeparator(received);
        received += 'n';
    }
    msg += ` It must be ${range}. Received ${received}`;
    return msg;
}, RangeError);
function $aa305406dd6eb8ab$var$addNumericalSeparator(val) {
    let res = '';
    let i = val.length;
    const start = val[0] === '-' ? 1 : 0;
    for(; i >= start + 4; i -= 3)res = `_${val.slice(i - 3, i)}${res}`;
    return `${val.slice(0, i)}${res}`;
}
// CHECK FUNCTIONS
// ===============
function $aa305406dd6eb8ab$var$checkBounds(buf, offset, byteLength) {
    $aa305406dd6eb8ab$var$validateNumber(offset, 'offset');
    if (buf[offset] === undefined || buf[offset + byteLength] === undefined) $aa305406dd6eb8ab$var$boundsError(offset, buf.length - (byteLength + 1));
}
function $aa305406dd6eb8ab$var$checkIntBI(value, min, max, buf, offset, byteLength) {
    if (value > max || value < min) {
        const n = typeof min === 'bigint' ? 'n' : '';
        let range;
        if (byteLength > 3) {
            if (min === 0 || min === BigInt(0)) range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
            else range = `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` + `${(byteLength + 1) * 8 - 1}${n}`;
        } else range = `>= ${min}${n} and <= ${max}${n}`;
        throw new $aa305406dd6eb8ab$var$errors.ERR_OUT_OF_RANGE('value', range, value);
    }
    $aa305406dd6eb8ab$var$checkBounds(buf, offset, byteLength);
}
function $aa305406dd6eb8ab$var$validateNumber(value, name) {
    if (typeof value !== 'number') throw new $aa305406dd6eb8ab$var$errors.ERR_INVALID_ARG_TYPE(name, 'number', value);
}
function $aa305406dd6eb8ab$var$boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
        $aa305406dd6eb8ab$var$validateNumber(value, type);
        throw new $aa305406dd6eb8ab$var$errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value);
    }
    if (length < 0) throw new $aa305406dd6eb8ab$var$errors.ERR_BUFFER_OUT_OF_BOUNDS();
    throw new $aa305406dd6eb8ab$var$errors.ERR_OUT_OF_RANGE(type || 'offset', `>= ${type ? 1 : 0} and <= ${length}`, value);
}
// HELPER FUNCTIONS
// ================
const $aa305406dd6eb8ab$var$INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
function $aa305406dd6eb8ab$var$base64clean(str) {
    // Node takes equal signs as end of the Base64 encoding
    str = str.split('=')[0];
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace($aa305406dd6eb8ab$var$INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return '';
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while(str.length % 4 !== 0)str = str + '=';
    return str;
}
function $aa305406dd6eb8ab$var$utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for(let i = 0; i < length; ++i){
        codePoint = string.charCodeAt(i);
        // is surrogate component
        if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
                // no lead yet
                if (codePoint > 0xDBFF) {
                    // unexpected trail
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                } else if (i + 1 === length) {
                    // unpaired lead
                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                    continue;
                }
                // valid lead
                leadSurrogate = codePoint;
                continue;
            }
            // 2 leads in a row
            if (codePoint < 0xDC00) {
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
                leadSurrogate = codePoint;
                continue;
            }
            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
        } else if (leadSurrogate) // valid bmp char, but last char was a lead
        {
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        }
        leadSurrogate = null;
        // encode utf8
        if (codePoint < 0x80) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
        } else throw new Error('Invalid code point');
    }
    return bytes;
}
function $aa305406dd6eb8ab$var$asciiToBytes(str) {
    const byteArray = [];
    for(let i = 0; i < str.length; ++i)// Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
    return byteArray;
}
function $aa305406dd6eb8ab$var$utf16leToBytes(str, units) {
    let c, hi, lo;
    const byteArray = [];
    for(let i = 0; i < str.length; ++i){
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
    }
    return byteArray;
}
function $aa305406dd6eb8ab$var$base64ToBytes(str) {
    return $d107091255e5286d$export$d622b2ad8d90c771($aa305406dd6eb8ab$var$base64clean(str));
}
function $aa305406dd6eb8ab$var$blitBuffer(src, dst, offset, length) {
    let i;
    for(i = 0; i < length; ++i){
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
    }
    return i;
}
// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function $aa305406dd6eb8ab$var$isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
}
function $aa305406dd6eb8ab$var$numberIsNaN(obj) {
    // For IE11 support
    return obj !== obj // eslint-disable-line no-self-compare
    ;
}
// Create lookup table for `toString('hex')`
// See: https://github.com/feross/buffer/issues/219
const $aa305406dd6eb8ab$var$hexSliceLookupTable = function() {
    const alphabet = '0123456789abcdef';
    const table = new Array(256);
    for(let i = 0; i < 16; ++i){
        const i16 = i * 16;
        for(let j = 0; j < 16; ++j)table[i16 + j] = alphabet[i] + alphabet[j];
    }
    return table;
}();
// Return not function with Error if BigInt not supported
function $aa305406dd6eb8ab$var$defineBigIntMethod(fn) {
    return typeof BigInt === 'undefined' ? $aa305406dd6eb8ab$var$BufferBigIntNotDefined : fn;
}
function $aa305406dd6eb8ab$var$BufferBigIntNotDefined() {
    throw new Error('BigInt not supported');
}


var $bdff222bb38616b2$require$Buffer = $aa305406dd6eb8ab$export$a143d493d941bafc;
//#region src/lib/errors.ts
var $bdff222bb38616b2$export$697502632950e9d3 = class extends Error {
    constructor(message){
        super(message);
        this.__isStorageError = true;
        this.name = "StorageError";
    }
};
function $bdff222bb38616b2$export$5a322e77e5eb0561(error) {
    return typeof error === "object" && error !== null && "__isStorageError" in error;
}
var $bdff222bb38616b2$export$ca9ecfd959b3871c = class extends $bdff222bb38616b2$export$697502632950e9d3 {
    constructor(message, status, statusCode){
        super(message);
        this.name = "StorageApiError";
        this.status = status;
        this.statusCode = statusCode;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        };
    }
};
var $bdff222bb38616b2$export$29127ca2e1a271d = class extends $bdff222bb38616b2$export$697502632950e9d3 {
    constructor(message, originalError){
        super(message);
        this.name = "StorageUnknownError";
        this.originalError = originalError;
    }
};
//#endregion
//#region src/lib/helpers.ts
const $bdff222bb38616b2$var$resolveFetch$1 = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
const $bdff222bb38616b2$var$resolveResponse$1 = ()=>{
    return Response;
};
const $bdff222bb38616b2$var$recursiveToCamel = (item)=>{
    if (Array.isArray(item)) return item.map((el)=>$bdff222bb38616b2$var$recursiveToCamel(el));
    else if (typeof item === "function" || item !== Object(item)) return item;
    const result = {};
    Object.entries(item).forEach(([key, value])=>{
        const newKey = key.replace(/([-_][a-z])/gi, (c)=>c.toUpperCase().replace(/[-_]/g, ""));
        result[newKey] = $bdff222bb38616b2$var$recursiveToCamel(value);
    });
    return result;
};
/**
* Determine if input is a plain object
* An object is plain if it's created by either {}, new Object(), or Object.create(null)
* source: https://github.com/sindresorhus/is-plain-obj
*/ const $bdff222bb38616b2$var$isPlainObject$1 = (value)=>{
    if (typeof value !== "object" || value === null) return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
/**
* Validates if a given bucket name is valid according to Supabase Storage API rules
* Mirrors backend validation from: storage/src/storage/limits.ts:isValidBucketName()
*
* Rules:
* - Length: 1-100 characters
* - Allowed characters: alphanumeric (a-z, A-Z, 0-9), underscore (_), and safe special characters
* - Safe special characters: ! - . * ' ( ) space & $ @ = ; : + , ?
* - Forbidden: path separators (/, \), path traversal (..), leading/trailing whitespace
*
* AWS S3 Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
*
* @param bucketName - The bucket name to validate
* @returns true if valid, false otherwise
*/ const $bdff222bb38616b2$var$isValidBucketName = (bucketName)=>{
    if (!bucketName || typeof bucketName !== "string") return false;
    if (bucketName.length === 0 || bucketName.length > 100) return false;
    if (bucketName.trim() !== bucketName) return false;
    if (bucketName.includes("/") || bucketName.includes("\\")) return false;
    return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName);
};
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function $bdff222bb38616b2$var$_typeof(o) {
    "@babel/helpers - typeof";
    return $bdff222bb38616b2$var$_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
        return typeof o$1;
    } : function(o$1) {
        return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, $bdff222bb38616b2$var$_typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function $bdff222bb38616b2$var$toPrimitive(t, r) {
    if ("object" != $bdff222bb38616b2$var$_typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != $bdff222bb38616b2$var$_typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function $bdff222bb38616b2$var$toPropertyKey(t) {
    var i = $bdff222bb38616b2$var$toPrimitive(t, "string");
    return "symbol" == $bdff222bb38616b2$var$_typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function $bdff222bb38616b2$var$_defineProperty(e, r, t) {
    return (r = $bdff222bb38616b2$var$toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function $bdff222bb38616b2$var$ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function $bdff222bb38616b2$var$_objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? $bdff222bb38616b2$var$ownKeys(Object(t), !0).forEach(function(r$1) {
            $bdff222bb38616b2$var$_defineProperty(e, r$1, t[r$1]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : $bdff222bb38616b2$var$ownKeys(Object(t)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
        });
    }
    return e;
}
//#endregion
//#region src/lib/fetch.ts
const $bdff222bb38616b2$var$_getErrorMessage$1 = (err)=>{
    var _err$error;
    return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_err$error = err.error) === null || _err$error === void 0 ? void 0 : _err$error.message) || JSON.stringify(err);
};
const $bdff222bb38616b2$var$handleError$1 = async (error, reject, options)=>{
    if (error instanceof await $bdff222bb38616b2$var$resolveResponse$1() && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) error.json().then((err)=>{
        const status = error.status || 500;
        const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + "";
        reject(new $bdff222bb38616b2$export$ca9ecfd959b3871c($bdff222bb38616b2$var$_getErrorMessage$1(err), status, statusCode));
    }).catch((err)=>{
        reject(new $bdff222bb38616b2$export$29127ca2e1a271d($bdff222bb38616b2$var$_getErrorMessage$1(err), err));
    });
    else reject(new $bdff222bb38616b2$export$29127ca2e1a271d($bdff222bb38616b2$var$_getErrorMessage$1(error), error));
};
const $bdff222bb38616b2$var$_getRequestParams$1 = (method, options, parameters, body)=>{
    const params = {
        method: method,
        headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
    };
    if (method === "GET" || !body) return params;
    if ($bdff222bb38616b2$var$isPlainObject$1(body)) {
        params.headers = $bdff222bb38616b2$var$_objectSpread2({
            "Content-Type": "application/json"
        }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
    } else params.body = body;
    if (options === null || options === void 0 ? void 0 : options.duplex) params.duplex = options.duplex;
    return $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, params), parameters);
};
async function $bdff222bb38616b2$var$_handleRequest$1(fetcher, method, url, options, parameters, body) {
    return new Promise((resolve, reject)=>{
        fetcher(url, $bdff222bb38616b2$var$_getRequestParams$1(method, options, parameters, body)).then((result)=>{
            if (!result.ok) throw result;
            if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
            return result.json();
        }).then((data)=>resolve(data)).catch((error)=>$bdff222bb38616b2$var$handleError$1(error, reject, options));
    });
}
async function $bdff222bb38616b2$var$get(fetcher, url, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest$1(fetcher, "GET", url, options, parameters);
}
async function $bdff222bb38616b2$var$post$1(fetcher, url, body, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest$1(fetcher, "POST", url, options, parameters, body);
}
async function $bdff222bb38616b2$var$put(fetcher, url, body, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest$1(fetcher, "PUT", url, options, parameters, body);
}
async function $bdff222bb38616b2$var$head(fetcher, url, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest$1(fetcher, "HEAD", url, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
        noResolveJson: true
    }), parameters);
}
async function $bdff222bb38616b2$var$remove(fetcher, url, body, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest$1(fetcher, "DELETE", url, options, parameters, body);
}
//#endregion
//#region src/packages/StreamDownloadBuilder.ts
var $bdff222bb38616b2$var$StreamDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError){
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
    }
    then(onfulfilled, onrejected) {
        return this.execute().then(onfulfilled, onrejected);
    }
    async execute() {
        var _this = this;
        try {
            return {
                data: (await _this.downloadFn()).body,
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/packages/BlobDownloadBuilder.ts
let $bdff222bb38616b2$var$_Symbol$toStringTag;
$bdff222bb38616b2$var$_Symbol$toStringTag = Symbol.toStringTag;
var $bdff222bb38616b2$var$BlobDownloadBuilder = class {
    constructor(downloadFn, shouldThrowOnError){
        this.downloadFn = downloadFn;
        this.shouldThrowOnError = shouldThrowOnError;
        this[$bdff222bb38616b2$var$_Symbol$toStringTag] = "BlobDownloadBuilder";
        this.promise = null;
    }
    asStream() {
        return new $bdff222bb38616b2$var$StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
    }
    then(onfulfilled, onrejected) {
        return this.getPromise().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
        return this.getPromise().catch(onrejected);
    }
    finally(onfinally) {
        return this.getPromise().finally(onfinally);
    }
    getPromise() {
        if (!this.promise) this.promise = this.execute();
        return this.promise;
    }
    async execute() {
        var _this = this;
        try {
            return {
                data: await (await _this.downloadFn()).blob(),
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/packages/StorageFileApi.ts
const $bdff222bb38616b2$var$DEFAULT_SEARCH_OPTIONS = {
    limit: 100,
    offset: 0,
    sortBy: {
        column: "name",
        order: "asc"
    }
};
const $bdff222bb38616b2$var$DEFAULT_FILE_OPTIONS = {
    cacheControl: "3600",
    contentType: "text/plain;charset=UTF-8",
    upsert: false
};
var $bdff222bb38616b2$var$StorageFileApi = class {
    constructor(url, headers = {}, bucketId, fetch$1){
        this.shouldThrowOnError = false;
        this.url = url;
        this.headers = headers;
        this.bucketId = bucketId;
        this.fetch = $bdff222bb38616b2$var$resolveFetch$1(fetch$1);
    }
    /**
	* Enable throwing errors instead of returning them.
	*
	* @category File Buckets
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
	*
	* @param method HTTP method.
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	*/ async uploadOrUpdate(method, path, fileBody, fileOptions) {
        var _this = this;
        try {
            let body;
            const options = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_FILE_OPTIONS), fileOptions);
            let headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, _this.headers), method === "POST" && {
                "x-upsert": String(options.upsert)
            });
            const metadata = options.metadata;
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
                body = new FormData();
                body.append("cacheControl", options.cacheControl);
                if (metadata) body.append("metadata", _this.encodeMetadata(metadata));
                body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
                body = fileBody;
                if (!body.has("cacheControl")) body.append("cacheControl", options.cacheControl);
                if (metadata && !body.has("metadata")) body.append("metadata", _this.encodeMetadata(metadata));
            } else {
                body = fileBody;
                headers["cache-control"] = `max-age=${options.cacheControl}`;
                headers["content-type"] = options.contentType;
                if (metadata) headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata));
                if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex) options.duplex = "half";
            }
            if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, headers), fileOptions.headers);
            const cleanPath = _this._removeEmptyFolders(path);
            const _path = _this._getFinalPath(cleanPath);
            const data = await (method == "PUT" ? $bdff222bb38616b2$var$put : $bdff222bb38616b2$var$post$1)(_this.fetch, `${_this.url}/object/${_path}`, body, $bdff222bb38616b2$var$_objectSpread2({
                headers: headers
            }, (options === null || options === void 0 ? void 0 : options.duplex) ? {
                duplex: options.duplex
            } : {}));
            return {
                data: {
                    path: cleanPath,
                    id: data.Id,
                    fullPath: data.Key
                },
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Uploads a file to an existing bucket.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Upload file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: false
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Upload file using `ArrayBuffer` from base64 file data
	* ```js
	* import { decode } from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/ async upload(path, fileBody, fileOptions) {
        return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
    }
    /**
	* Upload a file with a token generated from `createSignedUploadUrl`.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param token The token generated from `createSignedUploadUrl`
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions HTTP headers (cacheControl, contentType, etc.).
	* **Note:** The `upsert` option has no effect here. To enable upsert behavior,
	* pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
	* @returns Promise with response containing file path and fullPath or error
	*
	* @example Upload to a signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "folder/cat.jpg",
	*     "fullPath": "avatars/folder/cat.jpg"
	*   },
	*   "error": null
	* }
	* ```
	*/ async uploadToSignedUrl(path, token, fileBody, fileOptions) {
        var _this3 = this;
        const cleanPath = _this3._removeEmptyFolders(path);
        const _path = _this3._getFinalPath(cleanPath);
        const url = new URL(_this3.url + `/object/upload/sign/${_path}`);
        url.searchParams.set("token", token);
        try {
            let body;
            const options = $bdff222bb38616b2$var$_objectSpread2({
                upsert: $bdff222bb38616b2$var$DEFAULT_FILE_OPTIONS.upsert
            }, fileOptions);
            const headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, _this3.headers), {
                "x-upsert": String(options.upsert)
            });
            if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
                body = new FormData();
                body.append("cacheControl", options.cacheControl);
                body.append("", fileBody);
            } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
                body = fileBody;
                body.append("cacheControl", options.cacheControl);
            } else {
                body = fileBody;
                headers["cache-control"] = `max-age=${options.cacheControl}`;
                headers["content-type"] = options.contentType;
            }
            return {
                data: {
                    path: cleanPath,
                    fullPath: (await $bdff222bb38616b2$var$put(_this3.fetch, url.toString(), body, {
                        headers: headers
                    })).Key
                },
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Creates a signed upload URL.
	* Signed upload URLs can be used to upload files to the bucket without further authentication.
	* They are valid for 2 hours.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param options.upsert If set to true, allows the file to be overwritten if it already exists.
	* @returns Promise with response containing signed upload URL, token, and path or error
	*
	* @example Create Signed Upload URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUploadUrl('folder/cat.jpg')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
	*     "path": "folder/cat.jpg",
	*     "token": "<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createSignedUploadUrl(path, options) {
        var _this4 = this;
        try {
            let _path = _this4._getFinalPath(path);
            const headers = $bdff222bb38616b2$var$_objectSpread2({}, _this4.headers);
            if (options === null || options === void 0 ? void 0 : options.upsert) headers["x-upsert"] = "true";
            const data = await $bdff222bb38616b2$var$post$1(_this4.fetch, `${_this4.url}/object/upload/sign/${_path}`, {}, {
                headers: headers
            });
            const url = new URL(_this4.url + data.url);
            const token = url.searchParams.get("token");
            if (!token) throw new $bdff222bb38616b2$export$697502632950e9d3("No token returned by API");
            return {
                data: {
                    signedUrl: url.toString(),
                    path: path,
                    token: token
                },
                error: null
            };
        } catch (error) {
            if (_this4.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Replaces an existing file at the specified path with a new one.
	*
	* @category File Buckets
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Update file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: true
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Update file using `ArrayBuffer` from base64 file data
	* ```js
	* import {decode} from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/ async update(path, fileBody, fileOptions) {
        return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
    }
    /**
	* Moves an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
	* @param options The destination options.
	* @returns Promise with response containing success message or error
	*
	* @example Move file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .move('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully moved"
	*   },
	*   "error": null
	* }
	* ```
	*/ async move(fromPath, toPath, options) {
        var _this6 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post$1(_this6.fetch, `${_this6.url}/object/move`, {
                    bucketId: _this6.bucketId,
                    sourceKey: fromPath,
                    destinationKey: toPath,
                    destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
                }, {
                    headers: _this6.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this6.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Copies an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
	* @param options The destination options.
	* @returns Promise with response containing copied file path or error
	*
	* @example Copy file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .copy('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "avatars/private/avatar2.png"
	*   },
	*   "error": null
	* }
	* ```
	*/ async copy(fromPath, toPath, options) {
        var _this7 = this;
        try {
            return {
                data: {
                    path: (await $bdff222bb38616b2$var$post$1(_this7.fetch, `${_this7.url}/object/copy`, {
                        bucketId: _this7.bucketId,
                        sourceKey: fromPath,
                        destinationKey: toPath,
                        destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
                    }, {
                        headers: _this7.headers
                    })).Key
                },
                error: null
            };
        } catch (error) {
            if (_this7.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Promise with response containing signed URL or error
	*
	* @example Create Signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Create a signed URL for an asset with transformations
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Create a signed URL which triggers the download of the asset
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     download: true,
	*   })
	* ```
	*/ async createSignedUrl(path, expiresIn, options) {
        var _this8 = this;
        try {
            let _path = _this8._getFinalPath(path);
            let data = await $bdff222bb38616b2$var$post$1(_this8.fetch, `${_this8.url}/object/sign/${_path}`, $bdff222bb38616b2$var$_objectSpread2({
                expiresIn: expiresIn
            }, (options === null || options === void 0 ? void 0 : options.transform) ? {
                transform: options.transform
            } : {}), {
                headers: _this8.headers
            });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            data = {
                signedUrl: encodeURI(`${_this8.url}${data.signedURL}${downloadQueryParam}`)
            };
            return {
                data: data,
                error: null
            };
        } catch (error) {
            if (_this8.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
	* @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @returns Promise with response containing array of objects with signedUrl, path, and error or error
	*
	* @example Create Signed URLs
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "error": null,
	*       "path": "folder/avatar1.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*     },
	*     {
	*       "error": null,
	*       "path": "folder/avatar2.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/ async createSignedUrls(paths, expiresIn, options) {
        var _this9 = this;
        try {
            const data = await $bdff222bb38616b2$var$post$1(_this9.fetch, `${_this9.url}/object/sign/${_this9.bucketId}`, {
                expiresIn: expiresIn,
                paths: paths
            }, {
                headers: _this9.headers
            });
            const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
            return {
                data: data.map((datum)=>$bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, datum), {}, {
                        signedUrl: datum.signedURL ? encodeURI(`${_this9.url}${datum.signedURL}${downloadQueryParam}`) : null
                    })),
                error: null
            };
        } catch (error) {
            if (_this9.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
	*
	* @category File Buckets
	* @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns BlobDownloadBuilder instance for downloading the file
	*
	* @example Download file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": <BLOB>,
	*   "error": null
	* }
	* ```
	*
	* @example Download file with transformations
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*       quality: 80
	*     }
	*   })
	* ```
	*/ download(path, options) {
        const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image/authenticated" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        const queryString = transformationQuery ? `?${transformationQuery}` : "";
        const _path = this._getFinalPath(path);
        const downloadFn = ()=>$bdff222bb38616b2$var$get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
                headers: this.headers,
                noResolveJson: true
            });
        return new $bdff222bb38616b2$var$BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
    }
    /**
	* Retrieves the details of an existing file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing file metadata or error
	*
	* @example Get file info
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .info('folder/avatar1.png')
	* ```
	*/ async info(path) {
        var _this10 = this;
        const _path = _this10._getFinalPath(path);
        try {
            return {
                data: $bdff222bb38616b2$var$recursiveToCamel(await $bdff222bb38616b2$var$get(_this10.fetch, `${_this10.url}/object/info/${_path}`, {
                    headers: _this10.headers
                })),
                error: null
            };
        } catch (error) {
            if (_this10.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Checks the existence of a file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing boolean indicating file existence or error
	*
	* @example Check file existence
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .exists('folder/avatar1.png')
	* ```
	*/ async exists(path) {
        var _this11 = this;
        const _path = _this11._getFinalPath(path);
        try {
            await $bdff222bb38616b2$var$head(_this11.fetch, `${_this11.url}/object/${_path}`, {
                headers: _this11.headers
            });
            return {
                data: true,
                error: null
            };
        } catch (error) {
            if (_this11.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error) && error instanceof $bdff222bb38616b2$export$29127ca2e1a271d) {
                const originalError = error.originalError;
                if ([
                    400,
                    404
                ].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) return {
                    data: false,
                    error: error
                };
            }
            throw error;
        }
    }
    /**
	* A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
	* This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
	*
	* @category File Buckets
	* @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
	* @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Object with public URL
	*
	* @example Returns the URL for an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
	*   }
	* }
	* ```
	*
	* @example Returns the URL for an asset in a public bucket with transformations
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Returns the URL which triggers the download of an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     download: true,
	*   })
	* ```
	*/ getPublicUrl(path, options) {
        const _path = this._getFinalPath(path);
        const _queryString = [];
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
        if (downloadQueryParam !== "") _queryString.push(downloadQueryParam);
        const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image" : "object";
        const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
        if (transformationQuery !== "") _queryString.push(transformationQuery);
        let queryString = _queryString.join("&");
        if (queryString !== "") queryString = `?${queryString}`;
        return {
            data: {
                publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`)
            }
        };
    }
    /**
	* Deletes files within the same bucket
	*
	* @category File Buckets
	* @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
	* @returns Promise with response containing array of deleted file objects or error
	*
	* @example Delete file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .remove(['folder/avatar1.png'])
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [],
	*   "error": null
	* }
	* ```
	*/ async remove(paths) {
        var _this12 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$remove(_this12.fetch, `${_this12.url}/object/${_this12.bucketId}`, {
                    prefixes: paths
                }, {
                    headers: _this12.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this12.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Get file metadata
	* @param id the file id to retrieve metadata
	*/ /**
	* Update file metadata
	* @param id the file id to update metadata
	* @param meta the new file metadata
	*/ /**
	* Lists all the files and folders within a path of the bucket.
	*
	* @category File Buckets
	* @param path The folder path.
	* @param options Search options including limit (defaults to 100), offset, sortBy, and search
	* @param parameters Optional fetch parameters including signal for cancellation
	* @returns Promise with response containing array of files or error
	*
	* @example List files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "avatar1.png",
	*       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
	*       "updated_at": "2024-05-22T23:06:05.580Z",
	*       "created_at": "2024-05-22T23:04:34.443Z",
	*       "last_accessed_at": "2024-05-22T23:04:34.443Z",
	*       "metadata": {
	*         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
	*         "size": 32175,
	*         "mimetype": "image/png",
	*         "cacheControl": "max-age=3600",
	*         "lastModified": "2024-05-22T23:06:05.574Z",
	*         "contentLength": 32175,
	*         "httpStatusCode": 200
	*       }
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*
	* @example Search files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*     search: 'jon'
	*   })
	* ```
	*/ async list(path, options, parameters) {
        var _this13 = this;
        try {
            const body = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_SEARCH_OPTIONS), options), {}, {
                prefix: path || ""
            });
            return {
                data: await $bdff222bb38616b2$var$post$1(_this13.fetch, `${_this13.url}/object/list/${_this13.bucketId}`, body, {
                    headers: _this13.headers
                }, parameters),
                error: null
            };
        } catch (error) {
            if (_this13.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* @experimental this method signature might change in the future
	*
	* @category File Buckets
	* @param options search options
	* @param parameters
	*/ async listV2(options, parameters) {
        var _this14 = this;
        try {
            const body = $bdff222bb38616b2$var$_objectSpread2({}, options);
            return {
                data: await $bdff222bb38616b2$var$post$1(_this14.fetch, `${_this14.url}/object/list-v2/${_this14.bucketId}`, body, {
                    headers: _this14.headers
                }, parameters),
                error: null
            };
        } catch (error) {
            if (_this14.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    encodeMetadata(metadata) {
        return JSON.stringify(metadata);
    }
    toBase64(data) {
        if (typeof $bdff222bb38616b2$require$Buffer !== "undefined") return $bdff222bb38616b2$require$Buffer.from(data).toString("base64");
        return btoa(data);
    }
    _getFinalPath(path) {
        return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
    }
    _removeEmptyFolders(path) {
        return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
    }
    transformOptsToQueryString(transform) {
        const params = [];
        if (transform.width) params.push(`width=${transform.width}`);
        if (transform.height) params.push(`height=${transform.height}`);
        if (transform.resize) params.push(`resize=${transform.resize}`);
        if (transform.format) params.push(`format=${transform.format}`);
        if (transform.quality) params.push(`quality=${transform.quality}`);
        return params.join("&");
    }
};
//#endregion
//#region src/lib/version.ts
const $bdff222bb38616b2$var$version = "2.89.0";
//#endregion
//#region src/lib/constants.ts
const $bdff222bb38616b2$var$DEFAULT_HEADERS$1 = {
    "X-Client-Info": `storage-js/${$bdff222bb38616b2$var$version}`
};
//#endregion
//#region src/packages/StorageBucketApi.ts
var $bdff222bb38616b2$var$StorageBucketApi = class {
    constructor(url, headers = {}, fetch$1, opts){
        this.shouldThrowOnError = false;
        const baseUrl = new URL(url);
        if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
            if (/supabase\.(co|in|red)$/.test(baseUrl.hostname) && !baseUrl.hostname.includes("storage.supabase.")) baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
        }
        this.url = baseUrl.href.replace(/\/$/, "");
        this.headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_HEADERS$1), headers);
        this.fetch = $bdff222bb38616b2$var$resolveFetch$1(fetch$1);
    }
    /**
	* Enable throwing errors instead of returning them.
	*
	* @category File Buckets
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* Retrieves the details of all Storage buckets within an existing project.
	*
	* @category File Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of buckets or error
	*
	* @example List buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets()
	* ```
	*
	* @example List buckets with options
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc',
	*     search: 'prod'
	*   })
	* ```
	*/ async listBuckets(options) {
        var _this = this;
        try {
            const queryString = _this.listBucketOptionsToQueryString(options);
            return {
                data: await $bdff222bb38616b2$var$get(_this.fetch, `${_this.url}/bucket${queryString}`, {
                    headers: _this.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Retrieves the details of an existing Storage bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to retrieve.
	* @returns Promise with response containing bucket details or error
	*
	* @example Get bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .getBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "id": "avatars",
	*     "name": "avatars",
	*     "owner": "",
	*     "public": false,
	*     "file_size_limit": 1024,
	*     "allowed_mime_types": [
	*       "image/png"
	*     ],
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/ async getBucket(id) {
        var _this2 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$get(_this2.fetch, `${_this2.url}/bucket/${id}`, {
                    headers: _this2.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this2.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Creates a new Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are creating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
	*   - default bucket type is `STANDARD`
	* @returns Promise with response containing newly created bucket name or error
	*
	* @example Create bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .createBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "avatars"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createBucket(id, options = {
        public: false
    }) {
        var _this3 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post$1(_this3.fetch, `${_this3.url}/bucket`, {
                    id: id,
                    name: id,
                    type: options.type,
                    public: options.public,
                    file_size_limit: options.fileSizeLimit,
                    allowed_mime_types: options.allowedMimeTypes
                }, {
                    headers: _this3.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Updates a Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are updating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @returns Promise with response containing success message or error
	*
	* @example Update bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .updateBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully updated"
	*   },
	*   "error": null
	* }
	* ```
	*/ async updateBucket(id, options) {
        var _this4 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$put(_this4.fetch, `${_this4.url}/bucket/${id}`, {
                    id: id,
                    name: id,
                    public: options.public,
                    file_size_limit: options.fileSizeLimit,
                    allowed_mime_types: options.allowedMimeTypes
                }, {
                    headers: _this4.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this4.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Removes all objects inside a single bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to empty.
	* @returns Promise with success message or error
	*
	* @example Empty bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .emptyBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully emptied"
	*   },
	*   "error": null
	* }
	* ```
	*/ async emptyBucket(id) {
        var _this5 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post$1(_this5.fetch, `${_this5.url}/bucket/${id}/empty`, {}, {
                    headers: _this5.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this5.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
	* You must first `empty()` the bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to delete.
	* @returns Promise with success message or error
	*
	* @example Delete bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .deleteBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/ async deleteBucket(id) {
        var _this6 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$remove(_this6.fetch, `${_this6.url}/bucket/${id}`, {}, {
                    headers: _this6.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this6.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    listBucketOptionsToQueryString(options) {
        const params = {};
        if (options) {
            if ("limit" in options) params.limit = String(options.limit);
            if ("offset" in options) params.offset = String(options.offset);
            if (options.search) params.search = options.search;
            if (options.sortColumn) params.sortColumn = options.sortColumn;
            if (options.sortOrder) params.sortOrder = options.sortOrder;
        }
        return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
    }
};
//#endregion
//#region src/packages/StorageAnalyticsClient.ts
/**
* Client class for managing Analytics Buckets using Iceberg tables
* Provides methods for creating, listing, and deleting analytics buckets
*/ var $bdff222bb38616b2$export$6be1752cbca4e2bf = class {
    /**
	* @alpha
	*
	* Creates a new StorageAnalyticsClient instance
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param url - The base URL for the storage API
	* @param headers - HTTP headers to include in requests
	* @param fetch - Optional custom fetch implementation
	*
	* @example
	* ```typescript
	* const client = new StorageAnalyticsClient(url, headers)
	* ```
	*/ constructor(url, headers = {}, fetch$1){
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_HEADERS$1), headers);
        this.fetch = $bdff222bb38616b2$var$resolveFetch$1(fetch$1);
    }
    /**
	* @alpha
	*
	* Enable throwing errors instead of returning them in the response
	* When enabled, failed operations will throw instead of returning { data: null, error }
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @returns This instance for method chaining
	*/ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /**
	* @alpha
	*
	* Creates a new analytics bucket using Iceberg tables
	* Analytics buckets are optimized for analytical queries and data processing
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param name A unique name for the bucket you are creating
	* @returns Promise with response containing newly created analytics bucket or error
	*
	* @example Create analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "analytics-data",
	*     "type": "ANALYTICS",
	*     "format": "iceberg",
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/ async createBucket(name) {
        var _this = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post$1(_this.fetch, `${_this.url}/bucket`, {
                    name: name
                }, {
                    headers: _this.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* @alpha
	*
	* Retrieves the details of all Analytics Storage buckets within an existing project
	* Only returns buckets of type 'ANALYTICS'
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of analytics buckets or error
	*
	* @example List analytics buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc'
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "analytics-data",
	*       "type": "ANALYTICS",
	*       "format": "iceberg",
	*       "created_at": "2024-05-22T22:26:05.100Z",
	*       "updated_at": "2024-05-22T22:26:05.100Z"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/ async listBuckets(options) {
        var _this2 = this;
        try {
            const queryParams = new URLSearchParams();
            if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0) queryParams.set("limit", options.limit.toString());
            if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0) queryParams.set("offset", options.offset.toString());
            if (options === null || options === void 0 ? void 0 : options.sortColumn) queryParams.set("sortColumn", options.sortColumn);
            if (options === null || options === void 0 ? void 0 : options.sortOrder) queryParams.set("sortOrder", options.sortOrder);
            if (options === null || options === void 0 ? void 0 : options.search) queryParams.set("search", options.search);
            const queryString = queryParams.toString();
            const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`;
            return {
                data: await $bdff222bb38616b2$var$get(_this2.fetch, url, {
                    headers: _this2.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this2.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* @alpha
	*
	* Deletes an existing analytics bucket
	* A bucket can't be deleted with existing objects inside it
	* You must first empty the bucket before deletion
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName The unique identifier of the bucket you would like to delete
	* @returns Promise with response containing success message or error
	*
	* @example Delete analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .deleteBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/ async deleteBucket(bucketName) {
        var _this3 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$remove(_this3.fetch, `${_this3.url}/bucket/${bucketName}`, {}, {
                    headers: _this3.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$5a322e77e5eb0561(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
	* @alpha
	*
	* Get an Iceberg REST Catalog client configured for a specific analytics bucket
	* Use this to perform advanced table and namespace operations within the bucket
	* The returned client provides full access to the Apache Iceberg REST Catalog API
	* with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName - The name of the analytics bucket (warehouse) to connect to
	* @returns The wrapped Iceberg catalog client
	* @throws {StorageError} If the bucket name is invalid
	*
	* @example Get catalog and create table
	* ```js
	* // First, create an analytics bucket
	* const { data: bucket, error: bucketError } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	*
	* // Get the Iceberg catalog for that bucket
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Create a namespace
	* const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
	*
	* // Create a table with schema
	* const { data: tableMetadata, error: tableError } = await catalog.createTable(
	*   { namespace: ['default'] },
	*   {
	*     name: 'events',
	*     schema: {
	*       type: 'struct',
	*       fields: [
	*         { id: 1, name: 'id', type: 'long', required: true },
	*         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
	*         { id: 3, name: 'user_id', type: 'string', required: false }
	*       ],
	*       'schema-id': 0,
	*       'identifier-field-ids': [1]
	*     },
	*     'partition-spec': {
	*       'spec-id': 0,
	*       fields: []
	*     },
	*     'write-order': {
	*       'order-id': 0,
	*       fields: []
	*     },
	*     properties: {
	*       'write.format.default': 'parquet'
	*     }
	*   }
	* )
	* ```
	*
	* @example List tables in namespace
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all tables in the default namespace
	* const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
	* if (listError) {
	*   if (listError.isNotFound()) {
	*     console.log('Namespace not found')
	*   }
	*   return
	* }
	* console.log(tables) // [{ namespace: ['default'], name: 'events' }]
	* ```
	*
	* @example Working with namespaces
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all namespaces
	* const { data: namespaces } = await catalog.listNamespaces()
	*
	* // Create namespace with properties
	* await catalog.createNamespace(
	*   { namespace: ['production'] },
	*   { properties: { owner: 'data-team', env: 'prod' } }
	* )
	* ```
	*
	* @example Cleanup operations
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Drop table with purge option (removes all data)
	* const { error: dropError } = await catalog.dropTable(
	*   { namespace: ['default'], name: 'events' },
	*   { purge: true }
	* )
	*
	* if (dropError?.isNotFound()) {
	*   console.log('Table does not exist')
	* }
	*
	* // Drop namespace (must be empty)
	* await catalog.dropNamespace({ namespace: ['default'] })
	* ```
	*
	* @remarks
	* This method provides a bridge between Supabase's bucket management and the standard
	* Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
	* All authentication and configuration is handled automatically using your Supabase credentials.
	*
	* **Error Handling**: Invalid bucket names throw immediately. All catalog
	* operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
	* Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
	* Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
	*
	* **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
	* deletes all table data. Without it, the table is marked as deleted but data remains.
	*
	* **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
	* For complete API documentation and advanced usage, refer to the
	* [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
	*/ from(bucketName) {
        var _this4 = this;
        if (!$bdff222bb38616b2$var$isValidBucketName(bucketName)) throw new $bdff222bb38616b2$export$697502632950e9d3("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
        const catalog = new (0, $7df3d3e5727cc2ac$export$1ccb0cb30480e317)({
            baseUrl: this.url,
            catalogName: bucketName,
            auth: {
                type: "custom",
                getHeaders: async ()=>_this4.headers
            },
            fetch: this.fetch
        });
        const shouldThrowOnError = this.shouldThrowOnError;
        return new Proxy(catalog, {
            get (target, prop) {
                const value = target[prop];
                if (typeof value !== "function") return value;
                return async (...args)=>{
                    try {
                        return {
                            data: await value.apply(target, args),
                            error: null
                        };
                    } catch (error) {
                        if (shouldThrowOnError) throw error;
                        return {
                            data: null,
                            error: error
                        };
                    }
                };
            }
        });
    }
};
//#endregion
//#region src/lib/vectors/constants.ts
const $bdff222bb38616b2$var$DEFAULT_HEADERS = {
    "X-Client-Info": `storage-js/${$bdff222bb38616b2$var$version}`,
    "Content-Type": "application/json"
};
//#endregion
//#region src/lib/vectors/errors.ts
/**
* Base error class for all Storage Vectors errors
*/ var $bdff222bb38616b2$export$92ae90d5da46e8c0 = class extends Error {
    constructor(message){
        super(message);
        this.__isStorageVectorsError = true;
        this.name = "StorageVectorsError";
    }
};
/**
* Type guard to check if an error is a StorageVectorsError
* @param error - The error to check
* @returns True if the error is a StorageVectorsError
*/ function $bdff222bb38616b2$export$95bc534aa9e6b2f1(error) {
    return typeof error === "object" && error !== null && "__isStorageVectorsError" in error;
}
/**
* API error returned from S3 Vectors service
* Includes HTTP status code and service-specific error code
*/ var $bdff222bb38616b2$export$22e4871ee01e8e3f = class extends $bdff222bb38616b2$export$92ae90d5da46e8c0 {
    constructor(message, status, statusCode){
        super(message);
        this.name = "StorageVectorsApiError";
        this.status = status;
        this.statusCode = statusCode;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        };
    }
};
/**
* Unknown error that doesn't match expected error patterns
* Wraps the original error for debugging
*/ var $bdff222bb38616b2$export$26d7e1f64f113285 = class extends $bdff222bb38616b2$export$92ae90d5da46e8c0 {
    constructor(message, originalError){
        super(message);
        this.name = "StorageVectorsUnknownError";
        this.originalError = originalError;
    }
};
/**
* Error codes specific to S3 Vectors API
* Maps AWS service errors to application-friendly error codes
*/ let $bdff222bb38616b2$export$2f60cecd2e35a5da = /* @__PURE__ */ function(StorageVectorsErrorCode$1) {
    /** Internal server fault (HTTP 500) */ StorageVectorsErrorCode$1["InternalError"] = "InternalError";
    /** Resource already exists / conflict (HTTP 409) */ StorageVectorsErrorCode$1["S3VectorConflictException"] = "S3VectorConflictException";
    /** Resource not found (HTTP 404) */ StorageVectorsErrorCode$1["S3VectorNotFoundException"] = "S3VectorNotFoundException";
    /** Delete bucket while not empty (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorBucketNotEmpty"] = "S3VectorBucketNotEmpty";
    /** Exceeds bucket quota/limit (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorMaxBucketsExceeded"] = "S3VectorMaxBucketsExceeded";
    /** Exceeds index quota/limit (HTTP 400) */ StorageVectorsErrorCode$1["S3VectorMaxIndexesExceeded"] = "S3VectorMaxIndexesExceeded";
    return StorageVectorsErrorCode$1;
}({});
//#endregion
//#region src/lib/vectors/helpers.ts
/**
* Resolves the fetch implementation to use
* Uses custom fetch if provided, otherwise uses native fetch
*
* @param customFetch - Optional custom fetch implementation
* @returns Resolved fetch function
*/ const $bdff222bb38616b2$export$98d92b1aa79f8cc7 = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
/**
* Resolves the Response constructor to use
* Returns native Response constructor
*
* @returns Response constructor
*/ const $bdff222bb38616b2$export$ace1d6afc438cf26 = ()=>{
    return Response;
};
/**
* Determine if input is a plain object
* An object is plain if it's created by either {}, new Object(), or Object.create(null)
*
* @param value - Value to check
* @returns True if value is a plain object
* @source https://github.com/sindresorhus/is-plain-obj
*/ const $bdff222bb38616b2$export$53b83ca8eaab0383 = (value)=>{
    if (typeof value !== "object" || value === null) return false;
    const prototype = Object.getPrototypeOf(value);
    return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
/**
* Normalizes a number array to float32 format
* Ensures all vector values are valid 32-bit floats
*
* @param values - Array of numbers to normalize
* @returns Normalized float32 array
*/ const $bdff222bb38616b2$export$36d0323e8c95fa9b = (values)=>{
    return Array.from(new Float32Array(values));
};
/**
* Validates vector dimensions match expected dimension
* Throws error if dimensions don't match
*
* @param vector - Vector data to validate
* @param expectedDimension - Expected vector dimension
* @throws Error if dimensions don't match
*/ const $bdff222bb38616b2$export$aa19ff1b227ddd70 = (vector, expectedDimension)=>{
    if (expectedDimension !== void 0 && vector.float32.length !== expectedDimension) throw new Error(`Vector dimension mismatch: expected ${expectedDimension}, got ${vector.float32.length}`);
};
//#endregion
//#region src/lib/vectors/fetch.ts
/**
* Extracts error message from various error response formats
* @param err - Error object from API
* @returns Human-readable error message
*/ const $bdff222bb38616b2$var$_getErrorMessage = (err)=>err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
/**
* Handles fetch errors and converts them to StorageVectors error types
* @param error - The error caught from fetch
* @param reject - Promise rejection function
* @param options - Fetch options that may affect error handling
*/ const $bdff222bb38616b2$var$handleError = async (error, reject, options)=>{
    if (error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number" && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
        const status = error.status || 500;
        const responseError = error;
        if (typeof responseError.json === "function") responseError.json().then((err)=>{
            const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
            reject(new $bdff222bb38616b2$export$22e4871ee01e8e3f($bdff222bb38616b2$var$_getErrorMessage(err), status, statusCode));
        }).catch(()=>{
            const statusCode = status + "";
            reject(new $bdff222bb38616b2$export$22e4871ee01e8e3f(responseError.statusText || `HTTP ${status} error`, status, statusCode));
        });
        else {
            const statusCode = status + "";
            reject(new $bdff222bb38616b2$export$22e4871ee01e8e3f(responseError.statusText || `HTTP ${status} error`, status, statusCode));
        }
    } else reject(new $bdff222bb38616b2$export$26d7e1f64f113285($bdff222bb38616b2$var$_getErrorMessage(error), error));
};
/**
* Builds request parameters for fetch calls
* @param method - HTTP method
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters like AbortSignal
* @param body - Request body (will be JSON stringified if plain object)
* @returns Complete fetch request parameters
*/ const $bdff222bb38616b2$var$_getRequestParams = (method, options, parameters, body)=>{
    const params = {
        method: method,
        headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
    };
    if (method === "GET" || !body) return params;
    if ($bdff222bb38616b2$export$53b83ca8eaab0383(body)) {
        params.headers = $bdff222bb38616b2$var$_objectSpread2({
            "Content-Type": "application/json"
        }, options === null || options === void 0 ? void 0 : options.headers);
        params.body = JSON.stringify(body);
    } else params.body = body;
    return $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, params), parameters);
};
/**
* Internal request handler that wraps fetch with error handling
* @param fetcher - Fetch function to use
* @param method - HTTP method
* @param url - Request URL
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters
* @param body - Request body
* @returns Promise with parsed response or error
*/ async function $bdff222bb38616b2$var$_handleRequest(fetcher, method, url, options, parameters, body) {
    return new Promise((resolve, reject)=>{
        fetcher(url, $bdff222bb38616b2$var$_getRequestParams(method, options, parameters, body)).then((result)=>{
            if (!result.ok) throw result;
            if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
            const contentType = result.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) return {};
            return result.json();
        }).then((data)=>resolve(data)).catch((error)=>$bdff222bb38616b2$var$handleError(error, reject, options));
    });
}
/**
* Performs a POST request
* @param fetcher - Fetch function to use
* @param url - Request URL
* @param body - Request body to be JSON stringified
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters
* @returns Promise with parsed response
*/ async function $bdff222bb38616b2$var$post(fetcher, url, body, options, parameters) {
    return $bdff222bb38616b2$var$_handleRequest(fetcher, "POST", url, options, parameters, body);
}
//#endregion
//#region src/lib/vectors/VectorIndexApi.ts
/**
* @hidden
* Base implementation for vector index operations.
* Use {@link VectorBucketScope} via `supabase.storage.vectors.from('bucket')` instead.
*/ var $bdff222bb38616b2$export$50097ff1e36420b1 = class {
    /** Creates a new VectorIndexApi instance */ constructor(url, headers = {}, fetch$1){
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_HEADERS), headers);
        this.fetch = $bdff222bb38616b2$export$98d92b1aa79f8cc7(fetch$1);
    }
    /** Enable throwing errors instead of returning them in the response */ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /** Creates a new vector index within a bucket */ async createIndex(options) {
        var _this = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this.fetch, `${_this.url}/CreateIndex`, options, {
                    headers: _this.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Retrieves metadata for a specific vector index */ async getIndex(vectorBucketName, indexName) {
        var _this2 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this2.fetch, `${_this2.url}/GetIndex`, {
                    vectorBucketName: vectorBucketName,
                    indexName: indexName
                }, {
                    headers: _this2.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this2.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Lists vector indexes within a bucket with optional filtering and pagination */ async listIndexes(options) {
        var _this3 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this3.fetch, `${_this3.url}/ListIndexes`, options, {
                    headers: _this3.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Deletes a vector index and all its data */ async deleteIndex(vectorBucketName, indexName) {
        var _this4 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this4.fetch, `${_this4.url}/DeleteIndex`, {
                    vectorBucketName: vectorBucketName,
                    indexName: indexName
                }, {
                    headers: _this4.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this4.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/lib/vectors/VectorDataApi.ts
/**
* @hidden
* Base implementation for vector data operations.
* Use {@link VectorIndexScope} via `supabase.storage.vectors.from('bucket').index('idx')` instead.
*/ var $bdff222bb38616b2$export$5f2a4b6b8397c039 = class {
    /** Creates a new VectorDataApi instance */ constructor(url, headers = {}, fetch$1){
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_HEADERS), headers);
        this.fetch = $bdff222bb38616b2$export$98d92b1aa79f8cc7(fetch$1);
    }
    /** Enable throwing errors instead of returning them in the response */ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /** Inserts or updates vectors in batch (1-500 per request) */ async putVectors(options) {
        var _this = this;
        try {
            if (options.vectors.length < 1 || options.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
            return {
                data: await $bdff222bb38616b2$var$post(_this.fetch, `${_this.url}/PutVectors`, options, {
                    headers: _this.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Retrieves vectors by their keys in batch */ async getVectors(options) {
        var _this2 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this2.fetch, `${_this2.url}/GetVectors`, options, {
                    headers: _this2.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this2.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Lists vectors in an index with pagination */ async listVectors(options) {
        var _this3 = this;
        try {
            if (options.segmentCount !== void 0) {
                if (options.segmentCount < 1 || options.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
                if (options.segmentIndex !== void 0) {
                    if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
                }
            }
            return {
                data: await $bdff222bb38616b2$var$post(_this3.fetch, `${_this3.url}/ListVectors`, options, {
                    headers: _this3.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Queries for similar vectors using approximate nearest neighbor search */ async queryVectors(options) {
        var _this4 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this4.fetch, `${_this4.url}/QueryVectors`, options, {
                    headers: _this4.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this4.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Deletes vectors by their keys in batch (1-500 per request) */ async deleteVectors(options) {
        var _this5 = this;
        try {
            if (options.keys.length < 1 || options.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
            return {
                data: await $bdff222bb38616b2$var$post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, {
                    headers: _this5.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this5.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/lib/vectors/VectorBucketApi.ts
/**
* @hidden
* Base implementation for vector bucket operations.
* Use {@link StorageVectorsClient} via `supabase.storage.vectors` instead.
*/ var $bdff222bb38616b2$export$e8b640c07a633e69 = class {
    /** Creates a new VectorBucketApi instance */ constructor(url, headers = {}, fetch$1){
        this.shouldThrowOnError = false;
        this.url = url.replace(/\/$/, "");
        this.headers = $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, $bdff222bb38616b2$var$DEFAULT_HEADERS), headers);
        this.fetch = $bdff222bb38616b2$export$98d92b1aa79f8cc7(fetch$1);
    }
    /** Enable throwing errors instead of returning them in the response */ throwOnError() {
        this.shouldThrowOnError = true;
        return this;
    }
    /** Creates a new vector bucket */ async createBucket(vectorBucketName) {
        var _this = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this.fetch, `${_this.url}/CreateVectorBucket`, {
                    vectorBucketName: vectorBucketName
                }, {
                    headers: _this.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Retrieves metadata for a specific vector bucket */ async getBucket(vectorBucketName) {
        var _this2 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this2.fetch, `${_this2.url}/GetVectorBucket`, {
                    vectorBucketName: vectorBucketName
                }, {
                    headers: _this2.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this2.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Lists vector buckets with optional filtering and pagination */ async listBuckets(options = {}) {
        var _this3 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, {
                    headers: _this3.headers
                }),
                error: null
            };
        } catch (error) {
            if (_this3.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /** Deletes a vector bucket (must be empty first) */ async deleteBucket(vectorBucketName) {
        var _this4 = this;
        try {
            return {
                data: await $bdff222bb38616b2$var$post(_this4.fetch, `${_this4.url}/DeleteVectorBucket`, {
                    vectorBucketName: vectorBucketName
                }, {
                    headers: _this4.headers
                }) || {},
                error: null
            };
        } catch (error) {
            if (_this4.shouldThrowOnError) throw error;
            if ($bdff222bb38616b2$export$95bc534aa9e6b2f1(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
};
//#endregion
//#region src/lib/vectors/StorageVectorsClient.ts
/**
*
* @alpha
*
* Main client for interacting with S3 Vectors API
* Provides access to bucket, index, and vector data operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*
* **Usage Patterns:**
*
* ```typescript
* const { data, error } = await supabase
*  .storage
*  .vectors
*  .createBucket('embeddings-prod')
*
* // Access index operations via buckets
* const bucket = supabase.storage.vectors.from('embeddings-prod')
* await bucket.createIndex({
*   indexName: 'documents',
*   dataType: 'float32',
*   dimension: 1536,
*   distanceMetric: 'cosine'
* })
*
* // Access vector operations via index
* const index = bucket.index('documents')
* await index.putVectors({
*   vectors: [
*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
*   ]
* })
*
* // Query similar vectors
* const { data } = await index.queryVectors({
*   queryVector: { float32: [...] },
*   topK: 5,
*   returnDistance: true
* })
* ```
*/ var $bdff222bb38616b2$export$f8cb34cab8a13f87 = class extends $bdff222bb38616b2$export$e8b640c07a633e69 {
    /**
	* @alpha
	*
	* Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param url - Base URL of the Storage Vectors REST API.
	* @param options.headers - Optional headers (for example `Authorization`) applied to every request.
	* @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
	*
	* @example
	* ```typescript
	* const client = new StorageVectorsClient(url, options)
	* ```
	*/ constructor(url, options = {}){
        super(url, options.headers || {}, options.fetch);
    }
    /**
	*
	* @alpha
	*
	* Access operations for a specific vector bucket
	* Returns a scoped client for index and vector operations within the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Bucket-scoped client with index and vector operations
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/ from(vectorBucketName) {
        return new $bdff222bb38616b2$export$5a6e64e51df41f53(this.url, this.headers, vectorBucketName, this.fetch);
    }
    /**
	*
	* @alpha
	*
	* Creates a new vector bucket
	* Vector buckets are containers for vector indexes and their data
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Unique name for the vector bucket
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .createBucket('embeddings-prod')
	* ```
	*/ async createBucket(vectorBucketName) {
        var _superprop_getCreateBucket = ()=>super.createBucket, _this = this;
        return _superprop_getCreateBucket().call(_this, vectorBucketName);
    }
    /**
	*
	* @alpha
	*
	* Retrieves metadata for a specific vector bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Promise with bucket metadata or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .getBucket('embeddings-prod')
	*
	* console.log('Bucket created:', data?.vectorBucket.creationTime)
	* ```
	*/ async getBucket(vectorBucketName) {
        var _superprop_getGetBucket = ()=>super.getBucket, _this2 = this;
        return _superprop_getGetBucket().call(_this2, vectorBucketName);
    }
    /**
	*
	* @alpha
	*
	* Lists all vector buckets with optional filtering and pagination
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Optional filters (prefix, maxResults, nextToken)
	* @returns Promise with list of buckets or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .listBuckets({ prefix: 'embeddings-' })
	*
	* data?.vectorBuckets.forEach(bucket => {
	*   console.log(bucket.vectorBucketName)
	* })
	* ```
	*/ async listBuckets(options = {}) {
        var _superprop_getListBuckets = ()=>super.listBuckets, _this3 = this;
        return _superprop_getListBuckets().call(_this3, options);
    }
    /**
	*
	* @alpha
	*
	* Deletes a vector bucket (bucket must be empty)
	* All indexes must be deleted before deleting the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .deleteBucket('embeddings-old')
	* ```
	*/ async deleteBucket(vectorBucketName) {
        var _superprop_getDeleteBucket = ()=>super.deleteBucket, _this4 = this;
        return _superprop_getDeleteBucket().call(_this4, vectorBucketName);
    }
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector bucket
* Provides index management and access to vector operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/ var $bdff222bb38616b2$export$5a6e64e51df41f53 = class extends $bdff222bb38616b2$export$50097ff1e36420b1 {
    /**
	* @alpha
	*
	* Creates a helper that automatically scopes all index operations to the provided bucket.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/ constructor(url, headers, vectorBucketName, fetch$1){
        super(url, headers, fetch$1);
        this.vectorBucketName = vectorBucketName;
    }
    /**
	*
	* @alpha
	*
	* Creates a new vector index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Index configuration (vectorBucketName is automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.createIndex({
	*   indexName: 'documents-openai',
	*   dataType: 'float32',
	*   dimension: 1536,
	*   distanceMetric: 'cosine',
	*   metadataConfiguration: {
	*     nonFilterableMetadataKeys: ['raw_text']
	*   }
	* })
	* ```
	*/ async createIndex(options) {
        var _superprop_getCreateIndex = ()=>super.createIndex, _this5 = this;
        return _superprop_getCreateIndex().call(_this5, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this5.vectorBucketName
        }));
    }
    /**
	*
	* @alpha
	*
	* Lists indexes in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (vectorBucketName is automatically set)
	* @returns Promise with response containing indexes array and pagination token or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.listIndexes({ prefix: 'documents-' })
	* ```
	*/ async listIndexes(options = {}) {
        var _superprop_getListIndexes = ()=>super.listIndexes, _this6 = this;
        return _superprop_getListIndexes().call(_this6, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this6.vectorBucketName
        }));
    }
    /**
	*
	* @alpha
	*
	* Retrieves metadata for a specific index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to retrieve
	* @returns Promise with index metadata or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.getIndex('documents-openai')
	* console.log('Dimension:', data?.index.dimension)
	* ```
	*/ async getIndex(indexName) {
        var _superprop_getGetIndex = ()=>super.getIndex, _this7 = this;
        return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName);
    }
    /**
	*
	* @alpha
	*
	* Deletes an index from this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.deleteIndex('old-index')
	* ```
	*/ async deleteIndex(indexName) {
        var _superprop_getDeleteIndex = ()=>super.deleteIndex, _this8 = this;
        return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName);
    }
    /**
	*
	* @alpha
	*
	* Access operations for a specific index within this bucket
	* Returns a scoped client for vector data operations
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index
	* @returns Index-scoped client with vector data operations
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	*
	* // Insert vectors
	* await index.putVectors({
	*   vectors: [
	*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
	*   ]
	* })
	*
	* // Query similar vectors
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [...] },
	*   topK: 5
	* })
	* ```
	*/ index(indexName) {
        return new $bdff222bb38616b2$export$bb92e54e27a7dace(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
    }
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector index
* Provides vector data operations (put, get, list, query, delete)
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/ var $bdff222bb38616b2$export$bb92e54e27a7dace = class extends $bdff222bb38616b2$export$5f2a4b6b8397c039 {
    /**
	*
	* @alpha
	*
	* Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* ```
	*/ constructor(url, headers, vectorBucketName, indexName, fetch$1){
        super(url, headers, fetch$1);
        this.vectorBucketName = vectorBucketName;
        this.indexName = indexName;
    }
    /**
	*
	* @alpha
	*
	* Inserts or updates vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector insertion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.putVectors({
	*   vectors: [
	*     {
	*       key: 'doc-1',
	*       data: { float32: [0.1, 0.2, ...] },
	*       metadata: { title: 'Introduction', page: 1 }
	*     }
	*   ]
	* })
	* ```
	*/ async putVectors(options) {
        var _superprop_getPutVectors = ()=>super.putVectors, _this9 = this;
        return _superprop_getPutVectors().call(_this9, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this9.vectorBucketName,
            indexName: _this9.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Retrieves vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector retrieval options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.getVectors({
	*   keys: ['doc-1', 'doc-2'],
	*   returnMetadata: true
	* })
	* ```
	*/ async getVectors(options) {
        var _superprop_getGetVectors = ()=>super.getVectors, _this10 = this;
        return _superprop_getGetVectors().call(_this10, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this10.vectorBucketName,
            indexName: _this10.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Lists vectors in this index with pagination
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array and pagination token or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.listVectors({
	*   maxResults: 500,
	*   returnMetadata: true
	* })
	* ```
	*/ async listVectors(options = {}) {
        var _superprop_getListVectors = ()=>super.listVectors, _this11 = this;
        return _superprop_getListVectors().call(_this11, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this11.vectorBucketName,
            indexName: _this11.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Queries for similar vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Query options (bucket and index names automatically set)
	* @returns Promise with response containing matches array of similar vectors ordered by distance or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [0.1, 0.2, ...] },
	*   topK: 5,
	*   filter: { category: 'technical' },
	*   returnDistance: true,
	*   returnMetadata: true
	* })
	* ```
	*/ async queryVectors(options) {
        var _superprop_getQueryVectors = ()=>super.queryVectors, _this12 = this;
        return _superprop_getQueryVectors().call(_this12, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this12.vectorBucketName,
            indexName: _this12.indexName
        }));
    }
    /**
	*
	* @alpha
	*
	* Deletes vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Deletion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.deleteVectors({
	*   keys: ['doc-1', 'doc-2', 'doc-3']
	* })
	* ```
	*/ async deleteVectors(options) {
        var _superprop_getDeleteVectors = ()=>super.deleteVectors, _this13 = this;
        return _superprop_getDeleteVectors().call(_this13, $bdff222bb38616b2$var$_objectSpread2($bdff222bb38616b2$var$_objectSpread2({}, options), {}, {
            vectorBucketName: _this13.vectorBucketName,
            indexName: _this13.indexName
        }));
    }
};
//#endregion
//#region src/StorageClient.ts
var $bdff222bb38616b2$export$6c85f5032e75eff9 = class extends $bdff222bb38616b2$var$StorageBucketApi {
    /**
	* Creates a client for Storage buckets, files, analytics, and vectors.
	*
	* @category File Buckets
	* @example
	* ```ts
	* import { StorageClient } from '@supabase/storage-js'
	*
	* const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
	*   apikey: 'public-anon-key',
	* })
	* const avatars = storage.from('avatars')
	* ```
	*/ constructor(url, headers = {}, fetch$1, opts){
        super(url, headers, fetch$1, opts);
    }
    /**
	* Perform file operation in a bucket.
	*
	* @category File Buckets
	* @param id The bucket id to operate on.
	*
	* @example
	* ```typescript
	* const avatars = supabase.storage.from('avatars')
	* ```
	*/ from(id) {
        return new $bdff222bb38616b2$var$StorageFileApi(this.url, this.headers, id, this.fetch);
    }
    /**
	*
	* @alpha
	*
	* Access vector storage operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @returns A StorageVectorsClient instance configured with the current storage settings.
	*/ get vectors() {
        return new $bdff222bb38616b2$export$f8cb34cab8a13f87(this.url + "/vector", {
            headers: this.headers,
            fetch: this.fetch
        });
    }
    /**
	*
	* @alpha
	*
	* Access analytics storage operations using Iceberg tables.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @returns A StorageAnalyticsClient instance configured with the current storage settings.
	*/ get analytics() {
        return new $bdff222bb38616b2$export$6be1752cbca4e2bf(this.url + "/iceberg", this.headers, this.fetch);
    }
};




// Generated automatically during releases by scripts/update-version-files.ts
// This file provides runtime access to the package version for:
// - HTTP request headers (e.g., X-Client-Info header for API requests)
// - Debugging and support (identifying which version is running)
// - Telemetry and logging (version reporting in errors/analytics)
// - Ensuring build artifacts match the published package version
const $1b4c7f01677a4759$export$83d89fbfd8236492 = '2.89.0';


const $79e77f61ec218cd7$export$a4558fee79d6c8ae = 30000;
const $79e77f61ec218cd7$export$f20a97df8f5fe223 = 3;
const $79e77f61ec218cd7$export$a36ad0026e55ac00 = $79e77f61ec218cd7$export$f20a97df8f5fe223 * $79e77f61ec218cd7$export$a4558fee79d6c8ae;
const $79e77f61ec218cd7$export$7fedf552187f0c3d = 'http://localhost:9999';
const $79e77f61ec218cd7$export$86880b4b2e1a2384 = 'supabase.auth.token';
const $79e77f61ec218cd7$export$2f9161bad044dacb = '';
const $79e77f61ec218cd7$export$88a84136db6a4b64 = {
    'X-Client-Info': `gotrue-js/${(0, $1b4c7f01677a4759$export$83d89fbfd8236492)}`
};
const $79e77f61ec218cd7$export$5615c708618ee858 = {
    MAX_RETRIES: 10,
    RETRY_INTERVAL: 2
};
const $79e77f61ec218cd7$export$e4f5507f88977535 = 'X-Supabase-Api-Version';
const $79e77f61ec218cd7$export$1f9a66038489bdeb = {
    '2024-01-01': {
        timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
        name: '2024-01-01'
    }
};
const $79e77f61ec218cd7$export$7a68c9e70b9d3911 = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
const $79e77f61ec218cd7$export$5bd768495200f133 = 600000; // 10 minutes



/**
 * Base error thrown by Supabase Auth helpers.
 *
 * @example
 * ```ts
 * import { AuthError } from '@supabase/auth-js'
 *
 * throw new AuthError('Unexpected auth error', 500, 'unexpected')
 * ```
 */ class $47f551231c4752e9$export$145273558d58e0ac extends Error {
    constructor(message, status, code){
        super(message);
        this.__isAuthError = true;
        this.name = 'AuthError';
        this.status = status;
        this.code = code;
    }
}
function $47f551231c4752e9$export$cde1786a482f9a1c(error) {
    return typeof error === 'object' && error !== null && '__isAuthError' in error;
}
class $47f551231c4752e9$export$45fde0b55b14f37b extends $47f551231c4752e9$export$145273558d58e0ac {
    constructor(message, status, code){
        super(message, status, code);
        this.name = 'AuthApiError';
        this.status = status;
        this.code = code;
    }
}
function $47f551231c4752e9$export$4fe744aeb810d543(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthApiError';
}
class $47f551231c4752e9$export$f7559805d4a50078 extends $47f551231c4752e9$export$145273558d58e0ac {
    constructor(message, originalError){
        super(message);
        this.name = 'AuthUnknownError';
        this.originalError = originalError;
    }
}
class $47f551231c4752e9$export$823c745ae0673c5e extends $47f551231c4752e9$export$145273558d58e0ac {
    constructor(message, name, status, code){
        super(message, status, code);
        this.name = name;
        this.status = status;
    }
}
class $47f551231c4752e9$export$403b3fc0d3ad5f0c extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(){
        super('Auth session missing!', 'AuthSessionMissingError', 400, undefined);
    }
}
function $47f551231c4752e9$export$3e849aa4db565c1d(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthSessionMissingError';
}
class $47f551231c4752e9$export$7e277b620449c1b4 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(){
        super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500, undefined);
    }
}
class $47f551231c4752e9$export$9ef583f0381b4cc extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message){
        super(message, 'AuthInvalidCredentialsError', 400, undefined);
    }
}
class $47f551231c4752e9$export$bf5df8e043856ef5 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message, details = null){
        super(message, 'AuthImplicitGrantRedirectError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details
        };
    }
}
function $47f551231c4752e9$export$45edea3999507afd(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthImplicitGrantRedirectError';
}
class $47f551231c4752e9$export$39583657eb2a7027 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message, details = null){
        super(message, 'AuthPKCEGrantCodeExchangeError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details
        };
    }
}
class $47f551231c4752e9$export$11e8e15400b7b336 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(){
        super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", 'AuthPKCECodeVerifierMissingError', 400, 'pkce_code_verifier_not_found');
    }
}
function $47f551231c4752e9$export$398e1f2bb2c7a92(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthPKCECodeVerifierMissingError';
}
class $47f551231c4752e9$export$2423b763f68be1b4 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message, status){
        super(message, 'AuthRetryableFetchError', status, undefined);
    }
}
function $47f551231c4752e9$export$a77af358da5fb874(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthRetryableFetchError';
}
class $47f551231c4752e9$export$b034076aa04913a6 extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message, status, reasons){
        super(message, 'AuthWeakPasswordError', status, 'weak_password');
        this.reasons = reasons;
    }
}
function $47f551231c4752e9$export$dac36143fd8a46ef(error) {
    return $47f551231c4752e9$export$cde1786a482f9a1c(error) && error.name === 'AuthWeakPasswordError';
}
class $47f551231c4752e9$export$d04cb18528f2043e extends $47f551231c4752e9$export$823c745ae0673c5e {
    constructor(message){
        super(message, 'AuthInvalidJwtError', 400, 'invalid_jwt');
    }
}


/**
 * Avoid modifying this file. It's part of
 * https://github.com/supabase-community/base64url-js.  Submit all fixes on
 * that repo!
 */ /**
 * An array of characters that encode 6 bits into a Base64-URL alphabet
 * character.
 */ const $5c1fd3f86e5f2223$var$TO_BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
/**
 * An array of characters that can appear in a Base64-URL encoded string but
 * should be ignored.
 */ const $5c1fd3f86e5f2223$var$IGNORE_BASE64URL = ' \t\n\r='.split('');
/**
 * An array of 128 numbers that map a Base64-URL character to 6 bits, or if -2
 * used to skip the character, or if -1 used to error out.
 */ const $5c1fd3f86e5f2223$var$FROM_BASE64URL = (()=>{
    const charMap = new Array(128);
    for(let i = 0; i < charMap.length; i += 1)charMap[i] = -1;
    for(let i = 0; i < $5c1fd3f86e5f2223$var$IGNORE_BASE64URL.length; i += 1)charMap[$5c1fd3f86e5f2223$var$IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
    for(let i = 0; i < $5c1fd3f86e5f2223$var$TO_BASE64URL.length; i += 1)charMap[$5c1fd3f86e5f2223$var$TO_BASE64URL[i].charCodeAt(0)] = i;
    return charMap;
})();
function $5c1fd3f86e5f2223$export$744f452403189a3e(byte, state, emit) {
    if (byte !== null) {
        state.queue = state.queue << 8 | byte;
        state.queuedBits += 8;
        while(state.queuedBits >= 6){
            const pos = state.queue >> state.queuedBits - 6 & 63;
            emit($5c1fd3f86e5f2223$var$TO_BASE64URL[pos]);
            state.queuedBits -= 6;
        }
    } else if (state.queuedBits > 0) {
        state.queue = state.queue << 6 - state.queuedBits;
        state.queuedBits = 6;
        while(state.queuedBits >= 6){
            const pos = state.queue >> state.queuedBits - 6 & 63;
            emit($5c1fd3f86e5f2223$var$TO_BASE64URL[pos]);
            state.queuedBits -= 6;
        }
    }
}
function $5c1fd3f86e5f2223$export$403e86c86002a137(charCode, state, emit) {
    const bits = $5c1fd3f86e5f2223$var$FROM_BASE64URL[charCode];
    if (bits > -1) {
        // valid Base64-URL character
        state.queue = state.queue << 6 | bits;
        state.queuedBits += 6;
        while(state.queuedBits >= 8){
            emit(state.queue >> state.queuedBits - 8 & 0xff);
            state.queuedBits -= 8;
        }
    } else if (bits === -2) // ignore spaces, tabs, newlines, =
    return;
    else throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
}
function $5c1fd3f86e5f2223$export$abe65c864cc3fd34(str) {
    const base64 = [];
    const emitter = (char)=>{
        base64.push(char);
    };
    const state = {
        queue: 0,
        queuedBits: 0
    };
    $5c1fd3f86e5f2223$export$caccae6095ceb6da(str, (byte)=>{
        $5c1fd3f86e5f2223$export$744f452403189a3e(byte, state, emitter);
    });
    $5c1fd3f86e5f2223$export$744f452403189a3e(null, state, emitter);
    return base64.join('');
}
function $5c1fd3f86e5f2223$export$bd5d476f823ea024(str) {
    const conv = [];
    const utf8Emit = (codepoint)=>{
        conv.push(String.fromCodePoint(codepoint));
    };
    const utf8State = {
        utf8seq: 0,
        codepoint: 0
    };
    const b64State = {
        queue: 0,
        queuedBits: 0
    };
    const byteEmit = (byte)=>{
        $5c1fd3f86e5f2223$export$719b4117b3270757(byte, utf8State, utf8Emit);
    };
    for(let i = 0; i < str.length; i += 1)$5c1fd3f86e5f2223$export$403e86c86002a137(str.charCodeAt(i), b64State, byteEmit);
    return conv.join('');
}
function $5c1fd3f86e5f2223$export$d203cd9136753332(codepoint, emit) {
    if (codepoint <= 0x7f) {
        emit(codepoint);
        return;
    } else if (codepoint <= 0x7ff) {
        emit(0xc0 | codepoint >> 6);
        emit(0x80 | codepoint & 0x3f);
        return;
    } else if (codepoint <= 0xffff) {
        emit(0xe0 | codepoint >> 12);
        emit(0x80 | codepoint >> 6 & 0x3f);
        emit(0x80 | codepoint & 0x3f);
        return;
    } else if (codepoint <= 0x10ffff) {
        emit(0xf0 | codepoint >> 18);
        emit(0x80 | codepoint >> 12 & 0x3f);
        emit(0x80 | codepoint >> 6 & 0x3f);
        emit(0x80 | codepoint & 0x3f);
        return;
    }
    throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}
function $5c1fd3f86e5f2223$export$caccae6095ceb6da(str, emit) {
    for(let i = 0; i < str.length; i += 1){
        let codepoint = str.charCodeAt(i);
        if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
            // most UTF-16 codepoints are Unicode codepoints, except values in this
            // range where the next UTF-16 codepoint needs to be combined with the
            // current one to get the Unicode codepoint
            const highSurrogate = (codepoint - 0xd800) * 0x400 & 0xffff;
            const lowSurrogate = str.charCodeAt(i + 1) - 0xdc00 & 0xffff;
            codepoint = (lowSurrogate | highSurrogate) + 0x10000;
            i += 1;
        }
        $5c1fd3f86e5f2223$export$d203cd9136753332(codepoint, emit);
    }
}
function $5c1fd3f86e5f2223$export$719b4117b3270757(byte, state, emit) {
    if (state.utf8seq === 0) {
        if (byte <= 0x7f) {
            emit(byte);
            return;
        }
        // count the number of 1 leading bits until you reach 0
        for(let leadingBit = 1; leadingBit < 6; leadingBit += 1)if ((byte >> 7 - leadingBit & 1) === 0) {
            state.utf8seq = leadingBit;
            break;
        }
        if (state.utf8seq === 2) state.codepoint = byte & 31;
        else if (state.utf8seq === 3) state.codepoint = byte & 15;
        else if (state.utf8seq === 4) state.codepoint = byte & 7;
        else throw new Error('Invalid UTF-8 sequence');
        state.utf8seq -= 1;
    } else if (state.utf8seq > 0) {
        if (byte <= 0x7f) throw new Error('Invalid UTF-8 sequence');
        state.codepoint = state.codepoint << 6 | byte & 63;
        state.utf8seq -= 1;
        if (state.utf8seq === 0) emit(state.codepoint);
    }
}
function $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6(str) {
    const result = [];
    const state = {
        queue: 0,
        queuedBits: 0
    };
    const onByte = (byte)=>{
        result.push(byte);
    };
    for(let i = 0; i < str.length; i += 1)$5c1fd3f86e5f2223$export$403e86c86002a137(str.charCodeAt(i), state, onByte);
    return new Uint8Array(result);
}
function $5c1fd3f86e5f2223$export$a098e7b533f96db3(str) {
    const result = [];
    $5c1fd3f86e5f2223$export$caccae6095ceb6da(str, (byte)=>result.push(byte));
    return new Uint8Array(result);
}
function $5c1fd3f86e5f2223$export$3f156efe462a835e(bytes) {
    const result = [];
    const state = {
        queue: 0,
        queuedBits: 0
    };
    const onChar = (char)=>{
        result.push(char);
    };
    bytes.forEach((byte)=>$5c1fd3f86e5f2223$export$744f452403189a3e(byte, state, onChar));
    // always call with `null` after processing all bytes
    $5c1fd3f86e5f2223$export$744f452403189a3e(null, state, onChar);
    return result.join('');
}


function $96f7b0006107f2ac$export$e02d0a488392f690(expiresIn) {
    const timeNow = Math.round(Date.now() / 1000);
    return timeNow + expiresIn;
}
function $96f7b0006107f2ac$export$16db4ce6a8dfc285() {
    return Symbol('auth-callback');
}
const $96f7b0006107f2ac$export$4e09c449d6c407f7 = ()=>typeof window !== 'undefined' && typeof document !== 'undefined';
const $96f7b0006107f2ac$var$localStorageWriteTests = {
    tested: false,
    writable: false
};
const $96f7b0006107f2ac$export$9ec034ee80211814 = ()=>{
    if (!$96f7b0006107f2ac$export$4e09c449d6c407f7()) return false;
    try {
        if (typeof globalThis.localStorage !== 'object') return false;
    } catch (e) {
        // DOM exception when accessing `localStorage`
        return false;
    }
    if ($96f7b0006107f2ac$var$localStorageWriteTests.tested) return $96f7b0006107f2ac$var$localStorageWriteTests.writable;
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
        globalThis.localStorage.setItem(randomKey, randomKey);
        globalThis.localStorage.removeItem(randomKey);
        $96f7b0006107f2ac$var$localStorageWriteTests.tested = true;
        $96f7b0006107f2ac$var$localStorageWriteTests.writable = true;
    } catch (e) {
        // localStorage can't be written to
        // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
        $96f7b0006107f2ac$var$localStorageWriteTests.tested = true;
        $96f7b0006107f2ac$var$localStorageWriteTests.writable = false;
    }
    return $96f7b0006107f2ac$var$localStorageWriteTests.writable;
};
function $96f7b0006107f2ac$export$7a29392fb778224c(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === '#') try {
        const hashSearchParams = new URLSearchParams(url.hash.substring(1));
        hashSearchParams.forEach((value, key)=>{
            result[key] = value;
        });
    } catch (e) {
    // hash is not a query string
    }
    // search parameters take precedence over hash parameters
    url.searchParams.forEach((value, key)=>{
        result[key] = value;
    });
    return result;
}
const $96f7b0006107f2ac$export$98d92b1aa79f8cc7 = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
const $96f7b0006107f2ac$export$e8ad6599be1036a7 = (maybeResponse)=>{
    return typeof maybeResponse === 'object' && maybeResponse !== null && 'status' in maybeResponse && 'ok' in maybeResponse && 'json' in maybeResponse && typeof maybeResponse.json === 'function';
};
const $96f7b0006107f2ac$export$e82c36d29078a87f = async (storage, key, data)=>{
    await storage.setItem(key, JSON.stringify(data));
};
const $96f7b0006107f2ac$export$ba6fcb7c333d32c0 = async (storage, key)=>{
    const value = await storage.getItem(key);
    if (!value) return null;
    try {
        return JSON.parse(value);
    } catch (_a) {
        return value;
    }
};
const $96f7b0006107f2ac$export$d35c645d585317ec = async (storage, key)=>{
    await storage.removeItem(key);
};
class $96f7b0006107f2ac$export$85f6557964517f1a {
    constructor(){
        this.promise = new $96f7b0006107f2ac$export$85f6557964517f1a.promiseConstructor((res, rej)=>{
            this.resolve = res;
            this.reject = rej;
        });
    }
}
$96f7b0006107f2ac$export$85f6557964517f1a.promiseConstructor = Promise;
function $96f7b0006107f2ac$export$9a62e6c0a30e00bc(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new (0, $47f551231c4752e9$export$d04cb18528f2043e)('Invalid JWT structure');
    // Regex checks for base64url format
    for(let i = 0; i < parts.length; i++){
        if (!(0, $79e77f61ec218cd7$export$7a68c9e70b9d3911).test(parts[i])) throw new (0, $47f551231c4752e9$export$d04cb18528f2043e)('JWT not in base64url format');
    }
    const data = {
        // using base64url lib
        header: JSON.parse((0, $5c1fd3f86e5f2223$export$bd5d476f823ea024)(parts[0])),
        payload: JSON.parse((0, $5c1fd3f86e5f2223$export$bd5d476f823ea024)(parts[1])),
        signature: (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(parts[2]),
        raw: {
            header: parts[0],
            payload: parts[1]
        }
    };
    return data;
}
async function $96f7b0006107f2ac$export$e772c8ff12451969(time) {
    return await new Promise((accept)=>{
        setTimeout(()=>accept(null), time);
    });
}
function $96f7b0006107f2ac$export$9e1b8e833f44ff21(fn, isRetryable) {
    const promise = new Promise((accept, reject)=>{
        (async ()=>{
            for(let attempt = 0; attempt < Infinity; attempt++)try {
                const result = await fn(attempt);
                if (!isRetryable(attempt, null, result)) {
                    accept(result);
                    return;
                }
            } catch (e) {
                if (!isRetryable(attempt, e)) {
                    reject(e);
                    return;
                }
            }
        })();
    });
    return promise;
}
function $96f7b0006107f2ac$var$dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
}
function $96f7b0006107f2ac$export$b6c3b8498f152f15() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === 'undefined') {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        const charSetLen = charSet.length;
        let verifier = '';
        for(let i = 0; i < verifierLength; i++)verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
        return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, $96f7b0006107f2ac$var$dec2hex).join('');
}
async function $96f7b0006107f2ac$var$sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest('SHA-256', encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map((c)=>String.fromCharCode(c)).join('');
}
async function $96f7b0006107f2ac$export$eb79e16bb8189148(verifier) {
    const hasCryptoSupport = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined' && typeof TextEncoder !== 'undefined';
    if (!hasCryptoSupport) {
        console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
        return verifier;
    }
    const hashed = await $96f7b0006107f2ac$var$sha256(verifier);
    return btoa(hashed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function $96f7b0006107f2ac$export$81b177cadfcf873c(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = $96f7b0006107f2ac$export$b6c3b8498f152f15();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) storedCodeVerifier += '/PASSWORD_RECOVERY';
    await $96f7b0006107f2ac$export$e82c36d29078a87f(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await $96f7b0006107f2ac$export$eb79e16bb8189148(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
    return [
        codeChallenge,
        codeChallengeMethod
    ];
}
/** Parses the API version which is 2YYY-MM-DD. */ const $96f7b0006107f2ac$var$API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function $96f7b0006107f2ac$export$5f69ecf1c14d56fd(response) {
    const apiVersion = response.headers.get((0, $79e77f61ec218cd7$export$e4f5507f88977535));
    if (!apiVersion) return null;
    if (!apiVersion.match($96f7b0006107f2ac$var$API_VERSION_REGEX)) return null;
    try {
        const date = new Date(`${apiVersion}T00:00:00.0Z`);
        return date;
    } catch (e) {
        return null;
    }
}
function $96f7b0006107f2ac$export$a5850868adeb9253(exp) {
    if (!exp) throw new Error('Missing exp claim');
    const timeNow = Math.floor(Date.now() / 1000);
    if (exp <= timeNow) throw new Error('JWT has expired');
}
function $96f7b0006107f2ac$export$fa59f625ab60cb91(alg) {
    switch(alg){
        case 'RS256':
            return {
                name: 'RSASSA-PKCS1-v1_5',
                hash: {
                    name: 'SHA-256'
                }
            };
        case 'ES256':
            return {
                name: 'ECDSA',
                namedCurve: 'P-256',
                hash: {
                    name: 'SHA-256'
                }
            };
        default:
            throw new Error('Invalid alg claim');
    }
}
const $96f7b0006107f2ac$var$UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function $96f7b0006107f2ac$export$a4c72ae47296db0c(str) {
    if (!$96f7b0006107f2ac$var$UUID_REGEX.test(str)) throw new Error('@supabase/auth-js: Expected parameter to be UUID but is not');
}
function $96f7b0006107f2ac$export$52c7f0d8a78626b() {
    const proxyTarget = {};
    return new Proxy(proxyTarget, {
        get: (target, prop)=>{
            if (prop === '__isUserNotAvailableProxy') return true;
            // Preventative check for common problematic symbols during cloning/inspection
            // These symbols might be accessed by structuredClone or other internal mechanisms.
            if (typeof prop === 'symbol') {
                const sProp = prop.toString();
                if (sProp === 'Symbol(Symbol.toPrimitive)' || sProp === 'Symbol(Symbol.toStringTag)' || sProp === 'Symbol(util.inspect.custom)') // Node.js util.inspect
                return undefined;
            }
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
        },
        set: (_target, prop)=>{
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        },
        deleteProperty: (_target, prop)=>{
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        }
    });
}
function $96f7b0006107f2ac$export$28f3a5de6111309a(user, suppressWarningRef) {
    return new Proxy(user, {
        get: (target, prop, receiver)=>{
            // Allow internal checks without warning
            if (prop === '__isInsecureUserWarningProxy') return true;
            // Preventative check for common problematic symbols during cloning/inspection
            // These symbols might be accessed by structuredClone or other internal mechanisms
            if (typeof prop === 'symbol') {
                const sProp = prop.toString();
                if (sProp === 'Symbol(Symbol.toPrimitive)' || sProp === 'Symbol(Symbol.toStringTag)' || sProp === 'Symbol(util.inspect.custom)' || sProp === 'Symbol(nodejs.util.inspect.custom)') // Return the actual value for these symbols to allow proper inspection
                return Reflect.get(target, prop, receiver);
            }
            // Emit warning on first property access
            if (!suppressWarningRef.value && typeof prop === 'string') {
                console.warn('Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.');
                suppressWarningRef.value = true;
            }
            return Reflect.get(target, prop, receiver);
        }
    });
}
function $96f7b0006107f2ac$export$b7d58db314e0ac27(obj) {
    return JSON.parse(JSON.stringify(obj));
}



const $041cf3bbe560a6d3$var$_getErrorMessage = (err)=>err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const $041cf3bbe560a6d3$var$NETWORK_ERROR_CODES = [
    502,
    503,
    504
];
async function $041cf3bbe560a6d3$export$d3da1ecaf1206c58(error) {
    var _a;
    if (!(0, $96f7b0006107f2ac$export$e8ad6599be1036a7)(error)) throw new (0, $47f551231c4752e9$export$2423b763f68be1b4)($041cf3bbe560a6d3$var$_getErrorMessage(error), 0);
    if ($041cf3bbe560a6d3$var$NETWORK_ERROR_CODES.includes(error.status)) // status in 500...599 range - server had an error, request might be retryed.
    throw new (0, $47f551231c4752e9$export$2423b763f68be1b4)($041cf3bbe560a6d3$var$_getErrorMessage(error), error.status);
    let data;
    try {
        data = await error.json();
    } catch (e) {
        throw new (0, $47f551231c4752e9$export$f7559805d4a50078)($041cf3bbe560a6d3$var$_getErrorMessage(e), e);
    }
    let errorCode = undefined;
    const responseAPIVersion = (0, $96f7b0006107f2ac$export$5f69ecf1c14d56fd)(error);
    if (responseAPIVersion && responseAPIVersion.getTime() >= (0, $79e77f61ec218cd7$export$1f9a66038489bdeb)['2024-01-01'].timestamp && typeof data === 'object' && data && typeof data.code === 'string') errorCode = data.code;
    else if (typeof data === 'object' && data && typeof data.error_code === 'string') errorCode = data.error_code;
    if (!errorCode) {
        // Legacy support for weak password errors, when there were no error codes
        if (typeof data === 'object' && data && typeof data.weak_password === 'object' && data.weak_password && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.reasons.reduce((a, i)=>a && typeof i === 'string', true)) throw new (0, $47f551231c4752e9$export$b034076aa04913a6)($041cf3bbe560a6d3$var$_getErrorMessage(data), error.status, data.weak_password.reasons);
    } else if (errorCode === 'weak_password') throw new (0, $47f551231c4752e9$export$b034076aa04913a6)($041cf3bbe560a6d3$var$_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    else if (errorCode === 'session_not_found') // The `session_id` inside the JWT does not correspond to a row in the
    // `sessions` table. This usually means the user has signed out, has been
    // deleted, or their session has somehow been terminated.
    throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
    throw new (0, $47f551231c4752e9$export$45fde0b55b14f37b)($041cf3bbe560a6d3$var$_getErrorMessage(data), error.status || 500, errorCode);
}
const $041cf3bbe560a6d3$var$_getRequestParams = (method, options, parameters, body)=>{
    const params = {
        method: method,
        headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
    };
    if (method === 'GET') return params;
    params.headers = Object.assign({
        'Content-Type': 'application/json;charset=UTF-8'
    }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
};
async function $041cf3bbe560a6d3$export$8969b3850ca2cdfd(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[0, $79e77f61ec218cd7$export$e4f5507f88977535]) headers[0, $79e77f61ec218cd7$export$e4f5507f88977535] = (0, $79e77f61ec218cd7$export$1f9a66038489bdeb)['2024-01-01'].name;
    if (options === null || options === void 0 ? void 0 : options.jwt) headers['Authorization'] = `Bearer ${options.jwt}`;
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) qs['redirect_to'] = options.redirectTo;
    const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
    const data = await $041cf3bbe560a6d3$var$_handleRequest(fetcher, method, url + queryString, {
        headers: headers,
        noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : {
        data: Object.assign({}, data),
        error: null
    };
}
async function $041cf3bbe560a6d3$var$_handleRequest(fetcher, method, url, options, parameters, body) {
    const requestParams = $041cf3bbe560a6d3$var$_getRequestParams(method, options, parameters, body);
    let result;
    try {
        result = await fetcher(url, Object.assign({}, requestParams));
    } catch (e) {
        console.error(e);
        // fetch failed, likely due to a network or CORS error
        throw new (0, $47f551231c4752e9$export$2423b763f68be1b4)($041cf3bbe560a6d3$var$_getErrorMessage(e), 0);
    }
    if (!result.ok) await $041cf3bbe560a6d3$export$d3da1ecaf1206c58(result);
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
    try {
        return await result.json();
    } catch (e) {
        await $041cf3bbe560a6d3$export$d3da1ecaf1206c58(e);
    }
}
function $041cf3bbe560a6d3$export$273fe4673a018c2e(data) {
    var _a;
    let session = null;
    if ($041cf3bbe560a6d3$var$hasSession(data)) {
        session = Object.assign({}, data);
        if (!data.expires_at) session.expires_at = (0, $96f7b0006107f2ac$export$e02d0a488392f690)(data.expires_in);
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return {
        data: {
            session: session,
            user: user
        },
        error: null
    };
}
function $041cf3bbe560a6d3$export$db83aade1c2922c7(data) {
    const response = $041cf3bbe560a6d3$export$273fe4673a018c2e(data);
    if (!response.error && data.weak_password && typeof data.weak_password === 'object' && Array.isArray(data.weak_password.reasons) && data.weak_password.reasons.length && data.weak_password.message && typeof data.weak_password.message === 'string' && data.weak_password.reasons.reduce((a, i)=>a && typeof i === 'string', true)) response.data.weak_password = data.weak_password;
    return response;
}
function $041cf3bbe560a6d3$export$e20f488897843593(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return {
        data: {
            user: user
        },
        error: null
    };
}
function $041cf3bbe560a6d3$export$b04785c46dcd8f8b(data) {
    return {
        data: data,
        error: null
    };
}
function $041cf3bbe560a6d3$export$f5eaa950605b2146(data) {
    const { action_link: action_link, email_otp: email_otp, hashed_token: hashed_token, redirect_to: redirect_to, verification_type: verification_type } = data, rest = (0, $12716e7fca7b0c49$export$3c9a16f847548506)(data, [
        "action_link",
        "email_otp",
        "hashed_token",
        "redirect_to",
        "verification_type"
    ]);
    const properties = {
        action_link: action_link,
        email_otp: email_otp,
        hashed_token: hashed_token,
        redirect_to: redirect_to,
        verification_type: verification_type
    };
    const user = Object.assign({}, rest);
    return {
        data: {
            properties: properties,
            user: user
        },
        error: null
    };
}
function $041cf3bbe560a6d3$export$7aed01df6e045e31(data) {
    return data;
}
/**
 * hasSession checks if the response object contains a valid session
 * @param data A response object
 * @returns true if a session is in the response
 */ function $041cf3bbe560a6d3$var$hasSession(data) {
    return data.access_token && data.refresh_token && data.expires_in;
}



const $51574b67e9801d33$var$WeakPasswordReasons = [
    'length',
    'characters',
    'pwned'
];
const $51574b67e9801d33$var$AMRMethods = [
    'password',
    'otp',
    'oauth',
    'totp',
    'mfa/totp',
    'mfa/phone',
    'mfa/webauthn',
    'anonymous',
    'sso/saml',
    'magiclink',
    'web3',
    'oauth_provider/authorization_code'
];
const $51574b67e9801d33$var$FactorTypes = [
    'totp',
    'phone',
    'webauthn'
];
const $51574b67e9801d33$var$FactorVerificationStatuses = [
    'verified',
    'unverified'
];
const $51574b67e9801d33$var$MFATOTPChannels = [
    'sms',
    'whatsapp'
];
const $51574b67e9801d33$export$9a0f1d0c97ce73ca = [
    'global',
    'local',
    'others'
];



class $ff481397fb5f7271$export$2e2bcd8739ae039 {
    /**
     * Creates an admin API client that can be used to manage users and OAuth clients.
     *
     * @example
     * ```ts
     * import { GoTrueAdminApi } from '@supabase/auth-js'
     *
     * const admin = new GoTrueAdminApi({
     *   url: 'https://xyzcompany.supabase.co/auth/v1',
     *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
     * })
     * ```
     */ constructor({ url: url = '', headers: headers = {}, fetch: fetch }){
        this.url = url;
        this.headers = headers;
        this.fetch = (0, $96f7b0006107f2ac$export$98d92b1aa79f8cc7)(fetch);
        this.mfa = {
            listFactors: this._listFactors.bind(this),
            deleteFactor: this._deleteFactor.bind(this)
        };
        this.oauth = {
            listClients: this._listOAuthClients.bind(this),
            createClient: this._createOAuthClient.bind(this),
            getClient: this._getOAuthClient.bind(this),
            updateClient: this._updateOAuthClient.bind(this),
            deleteClient: this._deleteOAuthClient.bind(this),
            regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
        };
    }
    /**
     * Removes a logged-in session.
     * @param jwt A valid, logged-in JWT.
     * @param scope The logout sope.
     */ async signOut(jwt, scope = (0, $51574b67e9801d33$export$9a0f1d0c97ce73ca)[0]) {
        if ((0, $51574b67e9801d33$export$9a0f1d0c97ce73ca).indexOf(scope) < 0) throw new Error(`@supabase/auth-js: Parameter scope must be one of ${(0, $51574b67e9801d33$export$9a0f1d0c97ce73ca).join(', ')}`);
        try {
            await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/logout?scope=${scope}`, {
                headers: this.headers,
                jwt: jwt,
                noResolveJson: true
            });
            return {
                data: null,
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Sends an invite link to an email address.
     * @param email The email address of the user.
     * @param options Additional options to be included when inviting.
     */ async inviteUserByEmail(email, options = {}) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/invite`, {
                body: {
                    email: email,
                    data: options.data
                },
                headers: this.headers,
                redirectTo: options.redirectTo,
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Generates email links and OTPs to be sent via a custom email provider.
     * @param email The user's email.
     * @param options.password User password. For signup only.
     * @param options.data Optional user metadata. For signup only.
     * @param options.redirectTo The redirect url which should be appended to the generated link
     */ async generateLink(params) {
        try {
            const { options: options } = params, rest = (0, $12716e7fca7b0c49$export$3c9a16f847548506)(params, [
                "options"
            ]);
            const body = Object.assign(Object.assign({}, rest), options);
            if ('newEmail' in rest) {
                // replace newEmail with new_email in request body
                body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
                delete body['newEmail'];
            }
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/admin/generate_link`, {
                body: body,
                headers: this.headers,
                xform: (0, $041cf3bbe560a6d3$export$f5eaa950605b2146),
                redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    properties: null,
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    // User Admin API
    /**
     * Creates a new user.
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async createUser(attributes) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/admin/users`, {
                body: attributes,
                headers: this.headers,
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Get a list of users.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
     */ async listUsers(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const pagination = {
                nextPage: null,
                lastPage: 0,
                total: 0
            };
            const response = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/admin/users`, {
                headers: this.headers,
                noResolveJson: true,
                query: {
                    page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                    per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ''
                },
                xform: (0, $041cf3bbe560a6d3$export$7aed01df6e045e31)
            });
            if (response.error) throw response.error;
            const users = await response.json();
            const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
            const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
            if (links.length > 0) {
                links.forEach((link)=>{
                    const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                    const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                    pagination[`${rel}Page`] = page;
                });
                pagination.total = parseInt(total);
            }
            return {
                data: Object.assign(Object.assign({}, users), pagination),
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    users: []
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Get user by id.
     *
     * @param uid The user's unique identifier
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async getUserById(uid) {
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(uid);
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/admin/users/${uid}`, {
                headers: this.headers,
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Updates the user data.
     *
     * @param attributes The data you want to update.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async updateUserById(uid, attributes) {
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(uid);
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'PUT', `${this.url}/admin/users/${uid}`, {
                body: attributes,
                headers: this.headers,
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Delete a user. Requires a `service_role` key.
     *
     * @param id The user id you want to remove.
     * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
     * Defaults to false for backward compatibility.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async deleteUser(id, shouldSoftDelete = false) {
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(id);
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/admin/users/${id}`, {
                headers: this.headers,
                body: {
                    should_soft_delete: shouldSoftDelete
                },
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    user: null
                },
                error: error
            };
            throw error;
        }
    }
    async _listFactors(params) {
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(params.userId);
        try {
            const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/admin/users/${params.userId}/factors`, {
                headers: this.headers,
                xform: (factors)=>{
                    return {
                        data: {
                            factors: factors
                        },
                        error: null
                    };
                }
            });
            return {
                data: data,
                error: error
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    async _deleteFactor(params) {
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(params.userId);
        (0, $96f7b0006107f2ac$export$a4c72ae47296db0c)(params.id);
        try {
            const data = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
                headers: this.headers
            });
            return {
                data: data,
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Lists all OAuth clients with optional pagination.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _listOAuthClients(params) {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const pagination = {
                nextPage: null,
                lastPage: 0,
                total: 0
            };
            const response = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/admin/oauth/clients`, {
                headers: this.headers,
                noResolveJson: true,
                query: {
                    page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                    per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ''
                },
                xform: (0, $041cf3bbe560a6d3$export$7aed01df6e045e31)
            });
            if (response.error) throw response.error;
            const clients = await response.json();
            const total = (_e = response.headers.get('x-total-count')) !== null && _e !== void 0 ? _e : 0;
            const links = (_g = (_f = response.headers.get('link')) === null || _f === void 0 ? void 0 : _f.split(',')) !== null && _g !== void 0 ? _g : [];
            if (links.length > 0) {
                links.forEach((link)=>{
                    const page = parseInt(link.split(';')[0].split('=')[1].substring(0, 1));
                    const rel = JSON.parse(link.split(';')[1].split('=')[1]);
                    pagination[`${rel}Page`] = page;
                });
                pagination.total = parseInt(total);
            }
            return {
                data: Object.assign(Object.assign({}, clients), pagination),
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: {
                    clients: []
                },
                error: error
            };
            throw error;
        }
    }
    /**
     * Creates a new OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _createOAuthClient(params) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/admin/oauth/clients`, {
                body: params,
                headers: this.headers,
                xform: (client)=>{
                    return {
                        data: client,
                        error: null
                    };
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Gets details of a specific OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _getOAuthClient(clientId) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/admin/oauth/clients/${clientId}`, {
                headers: this.headers,
                xform: (client)=>{
                    return {
                        data: client,
                        error: null
                    };
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Updates an existing OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _updateOAuthClient(clientId, params) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'PUT', `${this.url}/admin/oauth/clients/${clientId}`, {
                body: params,
                headers: this.headers,
                xform: (client)=>{
                    return {
                        data: client,
                        error: null
                    };
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Deletes an OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _deleteOAuthClient(clientId) {
        try {
            await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/admin/oauth/clients/${clientId}`, {
                headers: this.headers,
                noResolveJson: true
            });
            return {
                data: null,
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
    /**
     * Regenerates the secret for an OAuth client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * This function should only be called on a server. Never expose your `service_role` key in the browser.
     */ async _regenerateOAuthClientSecret(clientId) {
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
                headers: this.headers,
                xform: (client)=>{
                    return {
                        data: client,
                        error: null
                    };
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            throw error;
        }
    }
}







/**
 * Returns a localStorage-like object that stores the key-value pairs in
 * memory.
 */ function $2cd39220df7b9b0b$export$d791f66d7e5710cf(store = {}) {
    return {
        getItem: (key)=>{
            return store[key] || null;
        },
        setItem: (key, value)=>{
            store[key] = value;
        },
        removeItem: (key)=>{
            delete store[key];
        }
    };
}



const $8d234999934c9269$export$e368aba7747330f2 = {
    /**
     * @experimental
     */ debug: !!(globalThis && (0, $96f7b0006107f2ac$export$9ec034ee80211814)() && globalThis.localStorage && globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true')
};
class $8d234999934c9269$export$23e9464cc010dff9 extends Error {
    constructor(message){
        super(message);
        this.isAcquireTimeout = true;
    }
}
class $8d234999934c9269$export$4aa56776043a4631 extends $8d234999934c9269$export$23e9464cc010dff9 {
}
class $8d234999934c9269$export$4b982ee840d3d915 extends $8d234999934c9269$export$23e9464cc010dff9 {
}
async function $8d234999934c9269$export$f4ff21938fb7af3c(name, acquireTimeout, fn) {
    if ($8d234999934c9269$export$e368aba7747330f2.debug) console.log('@supabase/gotrue-js: navigatorLock: acquire lock', name, acquireTimeout);
    const abortController = new globalThis.AbortController();
    if (acquireTimeout > 0) setTimeout(()=>{
        abortController.abort();
        if ($8d234999934c9269$export$e368aba7747330f2.debug) console.log('@supabase/gotrue-js: navigatorLock acquire timed out', name);
    }, acquireTimeout);
    // MDN article: https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
    // Wrapping navigator.locks.request() with a plain Promise is done as some
    // libraries like zone.js patch the Promise object to track the execution
    // context. However, it appears that most browsers use an internal promise
    // implementation when using the navigator.locks.request() API causing them
    // to lose context and emit confusing log messages or break certain features.
    // This wrapping is believed to help zone.js track the execution context
    // better.
    return await Promise.resolve().then(()=>globalThis.navigator.locks.request(name, acquireTimeout === 0 ? {
            mode: 'exclusive',
            ifAvailable: true
        } : {
            mode: 'exclusive',
            signal: abortController.signal
        }, async (lock)=>{
            if (lock) {
                if ($8d234999934c9269$export$e368aba7747330f2.debug) console.log('@supabase/gotrue-js: navigatorLock: acquired', name, lock.name);
                try {
                    return await fn();
                } finally{
                    if ($8d234999934c9269$export$e368aba7747330f2.debug) console.log('@supabase/gotrue-js: navigatorLock: released', name, lock.name);
                }
            } else if (acquireTimeout === 0) {
                if ($8d234999934c9269$export$e368aba7747330f2.debug) console.log('@supabase/gotrue-js: navigatorLock: not immediately available', name);
                throw new $8d234999934c9269$export$4aa56776043a4631(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
            } else {
                if ($8d234999934c9269$export$e368aba7747330f2.debug) try {
                    const result = await globalThis.navigator.locks.query();
                    console.log('@supabase/gotrue-js: Navigator LockManager state', JSON.stringify(result, null, '  '));
                } catch (e) {
                    console.warn('@supabase/gotrue-js: Error when querying Navigator LockManager state', e);
                }
                // Browser is not following the Navigator LockManager spec, it
                // returned a null lock when we didn't use ifAvailable. So we can
                // pretend the lock is acquired in the name of backward compatibility
                // and user experience and just run the function.
                console.warn('@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request');
                return await fn();
            }
        }));
}
const $8d234999934c9269$var$PROCESS_LOCKS = {};
async function $8d234999934c9269$export$b21ec9b2268372c7(name, acquireTimeout, fn) {
    var _a;
    const previousOperation = (_a = $8d234999934c9269$var$PROCESS_LOCKS[name]) !== null && _a !== void 0 ? _a : Promise.resolve();
    const currentOperation = Promise.race([
        previousOperation.catch(()=>{
            // ignore error of previous operation that we're waiting to finish
            return null;
        }),
        acquireTimeout >= 0 ? new Promise((_, reject)=>{
            setTimeout(()=>{
                reject(new $8d234999934c9269$export$4b982ee840d3d915(`Acquiring process lock with name "${name}" timed out`));
            }, acquireTimeout);
        }) : null
    ].filter((x)=>x)).catch((e)=>{
        if (e && e.isAcquireTimeout) throw e;
        return null;
    }).then(async ()=>{
        // previous operations finished and we didn't get a race on the acquire
        // timeout, so the current operation can finally start
        return await fn();
    });
    $8d234999934c9269$var$PROCESS_LOCKS[name] = currentOperation.catch(async (e)=>{
        if (e && e.isAcquireTimeout) {
            // if the current operation timed out, it doesn't mean that the previous
            // operation finished, so we need contnue waiting for it to finish
            await previousOperation;
            return null;
        }
        throw e;
    });
    // finally wait for the current operation to finish successfully, with an
    // error or with an acquire timeout error
    return await currentOperation;
}


/**
 * https://mathiasbynens.be/notes/globalthis
 */ function $106f2a0eaf375bd9$export$ad067ce270531206() {
    if (typeof globalThis === 'object') return;
    try {
        Object.defineProperty(Object.prototype, '__magic__', {
            get: function() {
                return this;
            },
            configurable: true
        });
        // @ts-expect-error 'Allow access to magic'
        __magic__.globalThis = __magic__;
        // @ts-expect-error 'Allow access to magic'
        delete Object.prototype.__magic__;
    } catch (e) {
        if (typeof self !== 'undefined') // @ts-expect-error 'Allow access to globals'
        self.globalThis = self;
    }
}




// types and functions copied over from viem so this library doesn't depend on it
function $f8ddd15b1bf1e8fe$export$88411125f012957a(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
    return address.toLowerCase();
}
function $f8ddd15b1bf1e8fe$export$1a8ceedbd5845648(hex) {
    return parseInt(hex, 16);
}
function $f8ddd15b1bf1e8fe$export$7ea66e3774a60b67(value) {
    const bytes = new TextEncoder().encode(value);
    const hex = Array.from(bytes, (byte)=>byte.toString(16).padStart(2, '0')).join('');
    return '0x' + hex;
}
function $f8ddd15b1bf1e8fe$export$7ee2e5fde403d4c8(parameters) {
    var _a;
    const { chainId: chainId, domain: domain, expirationTime: expirationTime, issuedAt: issuedAt = new Date(), nonce: nonce, notBefore: notBefore, requestId: requestId, resources: resources, scheme: scheme, uri: uri, version: version } = parameters;
    if (!Number.isInteger(chainId)) throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
    if (!domain) throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
    if (nonce && nonce.length < 8) throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
    if (!uri) throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
    if (version !== '1') throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version}`);
    if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes('\n')) throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
    // Construct message
    const address = $f8ddd15b1bf1e8fe$export$88411125f012957a(parameters.address);
    const origin = scheme ? `${scheme}://${domain}` : domain;
    const statement = parameters.statement ? `${parameters.statement}\n` : '';
    const prefix = `${origin} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}`;
    let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}${nonce ? `\nNonce: ${nonce}` : ''}\nIssued At: ${issuedAt.toISOString()}`;
    if (expirationTime) suffix += `\nExpiration Time: ${expirationTime.toISOString()}`;
    if (notBefore) suffix += `\nNot Before: ${notBefore.toISOString()}`;
    if (requestId) suffix += `\nRequest ID: ${requestId}`;
    if (resources) {
        let content = '\nResources:';
        for (const resource of resources){
            if (!resource || typeof resource !== 'string') throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
            content += `\n- ${resource}`;
        }
        suffix += content;
    }
    return `${prefix}\n${suffix}`;
}






/* eslint-disable @typescript-eslint/ban-ts-comment */ 
class $af3024f08a6e71ae$export$90f0c14a652de832 extends Error {
    constructor({ message: message, code: code, cause: cause, name: name }){
        var _a;
        // @ts-ignore: help Rollup understand that `cause` is okay to set
        super(message, {
            cause: cause
        });
        this.__isWebAuthnError = true;
        this.name = (_a = name !== null && name !== void 0 ? name : cause instanceof Error ? cause.name : undefined) !== null && _a !== void 0 ? _a : 'Unknown Error';
        this.code = code;
    }
}
class $af3024f08a6e71ae$export$2799e3b911935b0d extends $af3024f08a6e71ae$export$90f0c14a652de832 {
    constructor(message, originalError){
        super({
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: originalError,
            message: message
        });
        this.name = 'WebAuthnUnknownError';
        this.originalError = originalError;
    }
}
function $af3024f08a6e71ae$export$8596540875e19045(error) {
    return typeof error === 'object' && error !== null && '__isWebAuthnError' in error;
}
function $af3024f08a6e71ae$export$1c18a773f8a28a92({ error: error, options: options }) {
    var _a, _b, _c;
    const { publicKey: publicKey } = options;
    if (!publicKey) throw Error('options was missing required publicKey property');
    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'Registration ceremony was sent an abort signal',
            code: 'ERROR_CEREMONY_ABORTED',
            cause: error
        });
    } else if (error.name === 'ConstraintError') {
        if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 4)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'Discoverable credentials were required but no available authenticator supported it',
            code: 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT',
            cause: error
        });
        else if (// @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
        options.mediation === 'conditional' && ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === 'required') // https://w3c.github.io/webauthn/#sctn-createCredential (Step 22.4)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'User verification was required during automatic registration but it could not be performed',
            code: 'ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE',
            cause: error
        });
        else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === 'required') // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 5)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'User verification was required but no available authenticator supported it',
            code: 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT',
            cause: error
        });
    } else if (error.name === 'InvalidStateError') // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 20)
    // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 3)
    return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: 'The authenticator was previously registered',
        code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED',
        cause: error
    });
    else if (error.name === 'NotAllowedError') /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */ return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: error.message,
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error
    });
    else if (error.name === 'NotSupportedError') {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param)=>param.type === 'public-key');
        if (validPubKeyCredParams.length === 0) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 10)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'No entry in pubKeyCredParams was of type "public-key"',
            code: 'ERROR_MALFORMED_PUBKEYCREDPARAMS',
            cause: error
        });
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 2)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'No available authenticator supported any of the specified pubKeyCredParams algorithms',
            code: 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG',
            cause: error
        });
    } else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!(0, $5258140a77314b98$export$59e759560deddc3c)(effectiveDomain)) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 7)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: `${window.location.hostname} is an invalid domain`,
            code: 'ERROR_INVALID_DOMAIN',
            cause: error
        });
        else if (publicKey.rp.id !== effectiveDomain) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 8)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
            code: 'ERROR_INVALID_RP_ID',
            cause: error
        });
    } else if (error.name === 'TypeError') {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 5)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'User ID was not between 1 and 64 characters',
            code: 'ERROR_INVALID_USER_ID_LENGTH',
            cause: error
        });
    } else if (error.name === 'UnknownError') // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 1)
    // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 8)
    return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: 'The authenticator was unable to process the specified options, or could not create a new credential',
        code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
        cause: error
    });
    return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: 'a Non-Webauthn related error has occurred',
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error
    });
}
function $af3024f08a6e71ae$export$9b62fd498befe529({ error: error, options: options }) {
    const { publicKey: publicKey } = options;
    if (!publicKey) throw Error('options was missing required publicKey property');
    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal) // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: 'Authentication ceremony was sent an abort signal',
            code: 'ERROR_CEREMONY_ABORTED',
            cause: error
        });
    } else if (error.name === 'NotAllowedError') /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */ return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: error.message,
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error
    });
    else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!(0, $5258140a77314b98$export$59e759560deddc3c)(effectiveDomain)) // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 5)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: `${window.location.hostname} is an invalid domain`,
            code: 'ERROR_INVALID_DOMAIN',
            cause: error
        });
        else if (publicKey.rpId !== effectiveDomain) // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 6)
        return new $af3024f08a6e71ae$export$90f0c14a652de832({
            message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
            code: 'ERROR_INVALID_RP_ID',
            cause: error
        });
    } else if (error.name === 'UnknownError') // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 1)
    // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 12)
    return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: 'The authenticator was unable to process the specified options, or could not create a new assertion signature',
        code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
        cause: error
    });
    return new $af3024f08a6e71ae$export$90f0c14a652de832({
        message: 'a Non-Webauthn related error has occurred',
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error
    });
}


class $5258140a77314b98$export$442ada5d34ca6e87 {
    /**
     * Create an abort signal for a new WebAuthn operation.
     * Automatically cancels any existing operation.
     *
     * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
     */ createNewAbortSignal() {
        // Abort any existing calls to navigator.credentials.create() or navigator.credentials.get()
        if (this.controller) {
            const abortError = new Error('Cancelling existing WebAuthn API call for new one');
            abortError.name = 'AbortError';
            this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
    }
    /**
     * Manually cancel the current WebAuthn operation.
     * Useful for cleaning up when user cancels or navigates away.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
     */ cancelCeremony() {
        if (this.controller) {
            const abortError = new Error('Manually cancelling existing WebAuthn API call');
            abortError.name = 'AbortError';
            this.controller.abort(abortError);
            this.controller = undefined;
        }
    }
}
const $5258140a77314b98$export$4109de07ec7c8bef = new $5258140a77314b98$export$442ada5d34ca6e87();
function $5258140a77314b98$export$d02e6c69c68605f0(options) {
    if (!options) throw new Error('Credential creation options are required');
    // Check if the native parseCreationOptionsFromJSON method is available
    if (typeof PublicKeyCredential !== 'undefined' && 'parseCreationOptionsFromJSON' in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON === 'function') // Use the native WebAuthn Level 3 method
    return PublicKeyCredential.parseCreationOptionsFromJSON(/** we assert the options here as typescript still doesn't know about future webauthn types */ options);
    // Fallback to manual parsing for browsers that don't support the native method
    // Destructure to separate fields that need transformation
    const { challenge: challengeStr, user: userOpts, excludeCredentials: excludeCredentials } = options, restOptions = (0, $12716e7fca7b0c49$export$3c9a16f847548506)(options, [
        "challenge",
        "user",
        "excludeCredentials"
    ]);
    // Convert challenge from base64url to ArrayBuffer
    const challenge = (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(challengeStr).buffer;
    // Convert user.id from base64url to ArrayBuffer
    const user = Object.assign(Object.assign({}, userOpts), {
        id: (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(userOpts.id).buffer
    });
    // Build the result object
    const result = Object.assign(Object.assign({}, restOptions), {
        challenge: challenge,
        user: user
    });
    // Only add excludeCredentials if it exists
    if (excludeCredentials && excludeCredentials.length > 0) {
        result.excludeCredentials = new Array(excludeCredentials.length);
        for(let i = 0; i < excludeCredentials.length; i++){
            const cred = excludeCredentials[i];
            result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), {
                id: (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(cred.id).buffer,
                type: cred.type || 'public-key',
                // Cast transports to handle future transport types like "cable"
                transports: cred.transports
            });
        }
    }
    return result;
}
function $5258140a77314b98$export$943ff00a541d1017(options) {
    if (!options) throw new Error('Credential request options are required');
    // Check if the native parseRequestOptionsFromJSON method is available
    if (typeof PublicKeyCredential !== 'undefined' && 'parseRequestOptionsFromJSON' in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON === 'function') // Use the native WebAuthn Level 3 method
    return PublicKeyCredential.parseRequestOptionsFromJSON(options);
    // Fallback to manual parsing for browsers that don't support the native method
    // Destructure to separate fields that need transformation
    const { challenge: challengeStr, allowCredentials: allowCredentials } = options, restOptions = (0, $12716e7fca7b0c49$export$3c9a16f847548506)(options, [
        "challenge",
        "allowCredentials"
    ]);
    // Convert challenge from base64url to ArrayBuffer
    const challenge = (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(challengeStr).buffer;
    // Build the result object
    const result = Object.assign(Object.assign({}, restOptions), {
        challenge: challenge
    });
    // Only add allowCredentials if it exists
    if (allowCredentials && allowCredentials.length > 0) {
        result.allowCredentials = new Array(allowCredentials.length);
        for(let i = 0; i < allowCredentials.length; i++){
            const cred = allowCredentials[i];
            result.allowCredentials[i] = Object.assign(Object.assign({}, cred), {
                id: (0, $5c1fd3f86e5f2223$export$9cae2cd6076b8fb6)(cred.id).buffer,
                type: cred.type || 'public-key',
                // Cast transports to handle future transport types like "cable"
                transports: cred.transports
            });
        }
    }
    return result;
}
function $5258140a77314b98$export$4b534f6222f6d585(credential) {
    var _a;
    // Check if the credential instance has the toJSON method
    if ('toJSON' in credential && typeof credential.toJSON === 'function') // Use the native WebAuthn Level 3 method
    return credential.toJSON();
    const credentialWithAttachment = credential;
    return {
        id: credential.id,
        rawId: credential.id,
        response: {
            attestationObject: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(credential.response.attestationObject)),
            clientDataJSON: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(credential.response.clientDataJSON))
        },
        type: 'public-key',
        clientExtensionResults: credential.getClientExtensionResults(),
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined
    };
}
function $5258140a77314b98$export$b3350da6d3acaa5a(credential) {
    var _a;
    // Check if the credential instance has the toJSON method
    if ('toJSON' in credential && typeof credential.toJSON === 'function') // Use the native WebAuthn Level 3 method
    return credential.toJSON();
    // Fallback to manual conversion for browsers that don't support toJSON
    // Access authenticatorAttachment via type assertion to handle TypeScript version differences
    // @simplewebauthn/types includes this property but base TypeScript 4.7.4 doesn't
    const credentialWithAttachment = credential;
    const clientExtensionResults = credential.getClientExtensionResults();
    const assertionResponse = credential.response;
    return {
        id: credential.id,
        rawId: credential.id,
        response: {
            authenticatorData: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(assertionResponse.authenticatorData)),
            clientDataJSON: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(assertionResponse.clientDataJSON)),
            signature: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(assertionResponse.signature)),
            userHandle: assertionResponse.userHandle ? (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(new Uint8Array(assertionResponse.userHandle)) : undefined
        },
        type: 'public-key',
        clientExtensionResults: clientExtensionResults,
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: (_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined
    };
}
function $5258140a77314b98$export$59e759560deddc3c(hostname) {
    return(// Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === 'localhost' || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname));
}
/**
 * Determine if the browser is capable of WebAuthn.
 * Checks for necessary Web APIs: PublicKeyCredential and Credential Management.
 *
 * @returns {boolean} True if browser supports WebAuthn
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential#browser_compatibility MDN - PublicKeyCredential Browser Compatibility}
 */ function $5258140a77314b98$var$browserSupportsWebAuthn() {
    var _a, _b;
    return !!((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && 'PublicKeyCredential' in window && window.PublicKeyCredential && 'credentials' in navigator && typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === 'function' && typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === 'function');
}
async function $5258140a77314b98$export$e4658562cd85d5e4(options) {
    try {
        const response = await navigator.credentials.create(/** we assert the type here until typescript types are updated */ options);
        if (!response) return {
            data: null,
            error: new (0, $af3024f08a6e71ae$export$2799e3b911935b0d)('Empty credential response', response)
        };
        if (!(response instanceof PublicKeyCredential)) return {
            data: null,
            error: new (0, $af3024f08a6e71ae$export$2799e3b911935b0d)('Browser returned unexpected credential type', response)
        };
        return {
            data: response,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: (0, $af3024f08a6e71ae$export$1c18a773f8a28a92)({
                error: err,
                options: options
            })
        };
    }
}
async function $5258140a77314b98$export$298c59008c641b3e(options) {
    try {
        const response = await navigator.credentials.get(/** we assert the type here until typescript types are updated */ options);
        if (!response) return {
            data: null,
            error: new (0, $af3024f08a6e71ae$export$2799e3b911935b0d)('Empty credential response', response)
        };
        if (!(response instanceof PublicKeyCredential)) return {
            data: null,
            error: new (0, $af3024f08a6e71ae$export$2799e3b911935b0d)('Browser returned unexpected credential type', response)
        };
        return {
            data: response,
            error: null
        };
    } catch (err) {
        return {
            data: null,
            error: (0, $af3024f08a6e71ae$export$9b62fd498befe529)({
                error: err,
                options: options
            })
        };
    }
}
const $5258140a77314b98$export$315ccaead2259c48 = {
    hints: [
        'security-key'
    ],
    authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: false,
        /** set to preferred because older yubikeys don't have PIN/Biometric */ userVerification: 'preferred',
        residentKey: 'discouraged'
    },
    attestation: 'direct'
};
const $5258140a77314b98$export$26eadd1e9f10eb21 = {
    /** set to preferred because older yubikeys don't have PIN/Biometric */ userVerification: 'preferred',
    hints: [
        'security-key'
    ],
    attestation: 'direct'
};
function $5258140a77314b98$var$deepMerge(...sources) {
    const isObject = (val)=>val !== null && typeof val === 'object' && !Array.isArray(val);
    const isArrayBufferLike = (val)=>val instanceof ArrayBuffer || ArrayBuffer.isView(val);
    const result = {};
    for (const source of sources){
        if (!source) continue;
        for(const key in source){
            const value = source[key];
            if (value === undefined) continue;
            if (Array.isArray(value)) // preserve array reference, including unions like AuthenticatorTransport[]
            result[key] = value;
            else if (isArrayBufferLike(value)) result[key] = value;
            else if (isObject(value)) {
                const existing = result[key];
                if (isObject(existing)) result[key] = $5258140a77314b98$var$deepMerge(existing, value);
                else result[key] = $5258140a77314b98$var$deepMerge(value);
            } else result[key] = value;
        }
    }
    return result;
}
function $5258140a77314b98$export$3be75f4dca600793(baseOptions, overrides) {
    return $5258140a77314b98$var$deepMerge($5258140a77314b98$export$315ccaead2259c48, baseOptions, overrides || {});
}
function $5258140a77314b98$export$dd12a9ca29190b76(baseOptions, overrides) {
    return $5258140a77314b98$var$deepMerge($5258140a77314b98$export$26eadd1e9f10eb21, baseOptions, overrides || {});
}
class $5258140a77314b98$export$23264e48ebb7dee0 {
    constructor(client){
        this.client = client;
        // Bind all methods so they can be destructured
        this.enroll = this._enroll.bind(this);
        this.challenge = this._challenge.bind(this);
        this.verify = this._verify.bind(this);
        this.authenticate = this._authenticate.bind(this);
        this.register = this._register.bind(this);
    }
    /**
     * Enroll a new WebAuthn factor.
     * Creates an unverified WebAuthn factor that must be verified with a credential.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
     * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
     */ async _enroll(params) {
        return this.client.mfa.enroll(Object.assign(Object.assign({}, params), {
            factorType: 'webauthn'
        }));
    }
    /**
     * Challenge for WebAuthn credential creation or authentication.
     * Combines server challenge with browser credential operations.
     * Handles both registration (create) and authentication (request) flows.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
     * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
     * @returns {Promise<RequestResult>} Challenge response with credential or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
     */ async _challenge({ factorId: factorId, webauthn: webauthn, friendlyName: friendlyName, signal: signal }, overrides) {
        try {
            // Get challenge from server using the client's MFA methods
            const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
                factorId: factorId,
                webauthn: webauthn
            });
            if (!challengeResponse) return {
                data: null,
                error: challengeError
            };
            const abortSignal = signal !== null && signal !== void 0 ? signal : $5258140a77314b98$export$4109de07ec7c8bef.createNewAbortSignal();
            /** webauthn will fail if either of the name/displayname are blank */ if (challengeResponse.webauthn.type === 'create') {
                const { user: user } = challengeResponse.webauthn.credential_options.publicKey;
                if (!user.name) user.name = `${user.id}:${friendlyName}`;
                if (!user.displayName) user.displayName = user.name;
            }
            switch(challengeResponse.webauthn.type){
                case 'create':
                    {
                        const options = $5258140a77314b98$export$3be75f4dca600793(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
                        const { data: data, error: error } = await $5258140a77314b98$export$e4658562cd85d5e4({
                            publicKey: options,
                            signal: abortSignal
                        });
                        if (data) return {
                            data: {
                                factorId: factorId,
                                challengeId: challengeResponse.id,
                                webauthn: {
                                    type: challengeResponse.webauthn.type,
                                    credential_response: data
                                }
                            },
                            error: null
                        };
                        return {
                            data: null,
                            error: error
                        };
                    }
                case 'request':
                    {
                        const options = $5258140a77314b98$export$dd12a9ca29190b76(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
                        const { data: data, error: error } = await $5258140a77314b98$export$298c59008c641b3e(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), {
                            publicKey: options,
                            signal: abortSignal
                        }));
                        if (data) return {
                            data: {
                                factorId: factorId,
                                challengeId: challengeResponse.id,
                                webauthn: {
                                    type: challengeResponse.webauthn.type,
                                    credential_response: data
                                }
                            },
                            error: null
                        };
                        return {
                            data: null,
                            error: error
                        };
                    }
            }
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            return {
                data: null,
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Unexpected error in challenge', error)
            };
        }
    }
    /**
     * Verify a WebAuthn credential with the server.
     * Completes the WebAuthn ceremony by sending the credential to the server for verification.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Verification parameters
     * @param {string} params.challengeId - ID of the challenge being verified
     * @param {string} params.factorId - ID of the WebAuthn factor
     * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
     * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
     * */ async _verify({ challengeId: challengeId, factorId: factorId, webauthn: webauthn }) {
        return this.client.mfa.verify({
            factorId: factorId,
            challengeId: challengeId,
            webauthn: webauthn
        });
    }
    /**
     * Complete WebAuthn authentication flow.
     * Performs challenge and verification in a single operation for existing credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Authentication parameters
     * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
     * @param {Object} params.webauthn - WebAuthn configuration
     * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.webauthn.signal - Optional abort signal
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
     * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
     */ async _authenticate({ factorId: factorId, webauthn: { rpId: rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins: rpOrigins = typeof window !== 'undefined' ? [
        window.location.origin
    ] : undefined, signal: signal } = {} }, overrides) {
        if (!rpId) return {
            data: null,
            error: new (0, $47f551231c4752e9$export$145273558d58e0ac)('rpId is required for WebAuthn authentication')
        };
        try {
            if (!$5258140a77314b98$var$browserSupportsWebAuthn()) return {
                data: null,
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Browser does not support WebAuthn', null)
            };
            // Get challenge and credential
            const { data: challengeResponse, error: challengeError } = await this.challenge({
                factorId: factorId,
                webauthn: {
                    rpId: rpId,
                    rpOrigins: rpOrigins
                },
                signal: signal
            }, {
                request: overrides
            });
            if (!challengeResponse) return {
                data: null,
                error: challengeError
            };
            const { webauthn: webauthn } = challengeResponse;
            // Verify credential
            return this._verify({
                factorId: factorId,
                challengeId: challengeResponse.challengeId,
                webauthn: {
                    type: webauthn.type,
                    rpId: rpId,
                    rpOrigins: rpOrigins,
                    credential_response: webauthn.credential_response
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            return {
                data: null,
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Unexpected error in authenticate', error)
            };
        }
    }
    /**
     * Complete WebAuthn registration flow.
     * Performs enrollment, challenge, and verification in a single operation for new credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Registration parameters
     * @param {string} params.friendlyName - User-friendly name for the credential
     * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.signal - Optional abort signal
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
     */ async _register({ friendlyName: friendlyName, webauthn: { rpId: rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins: rpOrigins = typeof window !== 'undefined' ? [
        window.location.origin
    ] : undefined, signal: signal } = {} }, overrides) {
        if (!rpId) return {
            data: null,
            error: new (0, $47f551231c4752e9$export$145273558d58e0ac)('rpId is required for WebAuthn registration')
        };
        try {
            if (!$5258140a77314b98$var$browserSupportsWebAuthn()) return {
                data: null,
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Browser does not support WebAuthn', null)
            };
            // Enroll factor
            const { data: factor, error: enrollError } = await this._enroll({
                friendlyName: friendlyName
            });
            if (!factor) {
                await this.client.mfa.listFactors().then((factors)=>{
                    var _a;
                    return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v)=>v.factor_type === 'webauthn' && v.friendly_name === friendlyName && v.status !== 'unverified');
                }).then((factor)=>factor ? this.client.mfa.unenroll({
                        factorId: factor === null || factor === void 0 ? void 0 : factor.id
                    }) : void 0);
                return {
                    data: null,
                    error: enrollError
                };
            }
            // Get challenge and create credential
            const { data: challengeResponse, error: challengeError } = await this._challenge({
                factorId: factor.id,
                friendlyName: factor.friendly_name,
                webauthn: {
                    rpId: rpId,
                    rpOrigins: rpOrigins
                },
                signal: signal
            }, {
                create: overrides
            });
            if (!challengeResponse) return {
                data: null,
                error: challengeError
            };
            return this._verify({
                factorId: factor.id,
                challengeId: challengeResponse.challengeId,
                webauthn: {
                    rpId: rpId,
                    rpOrigins: rpOrigins,
                    type: challengeResponse.webauthn.type,
                    credential_response: challengeResponse.webauthn.credential_response
                }
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return {
                data: null,
                error: error
            };
            return {
                data: null,
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Unexpected error in register', error)
            };
        }
    }
}


(0, $106f2a0eaf375bd9$export$ad067ce270531206)(); // Make "globalThis" available
const $9319d2e9f8204577$var$DEFAULT_OPTIONS = {
    url: (0, $79e77f61ec218cd7$export$7fedf552187f0c3d),
    storageKey: (0, $79e77f61ec218cd7$export$86880b4b2e1a2384),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: (0, $79e77f61ec218cd7$export$88a84136db6a4b64),
    flowType: 'implicit',
    debug: false,
    hasCustomAuthorizationHeader: false,
    throwOnError: false
};
async function $9319d2e9f8204577$var$lockNoOp(name, acquireTimeout, fn) {
    return await fn();
}
/**
 * Caches JWKS values for all clients created in the same environment. This is
 * especially useful for shared-memory execution environments such as Vercel's
 * Fluid Compute, AWS Lambda or Supabase's Edge Functions. Regardless of how
 * many clients are created, if they share the same storage key they will use
 * the same JWKS cache, significantly speeding up getClaims() with asymmetric
 * JWTs.
 */ const $9319d2e9f8204577$var$GLOBAL_JWKS = {};
class $9319d2e9f8204577$var$GoTrueClient {
    /**
     * The JWKS used for verifying asymmetric JWTs
     */ get jwks() {
        var _a, _b;
        return (_b = (_a = $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : {
            keys: []
        };
    }
    set jwks(value) {
        $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey]), {
            jwks: value
        });
    }
    get jwks_cached_at() {
        var _a, _b;
        return (_b = (_a = $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
    }
    set jwks_cached_at(value) {
        $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, $9319d2e9f8204577$var$GLOBAL_JWKS[this.storageKey]), {
            cachedAt: value
        });
    }
    /**
     * Create a new client for use in the browser.
     *
     * @example
     * ```ts
     * import { GoTrueClient } from '@supabase/auth-js'
     *
     * const auth = new GoTrueClient({
     *   url: 'https://xyzcompany.supabase.co/auth/v1',
     *   headers: { apikey: 'public-anon-key' },
     *   storageKey: 'supabase-auth',
     * })
     * ```
     */ constructor(options){
        var _a, _b, _c;
        /**
         * @experimental
         */ this.userStorage = null;
        this.memoryStorage = null;
        this.stateChangeEmitters = new Map();
        this.autoRefreshTicker = null;
        this.visibilityChangedCallback = null;
        this.refreshingDeferred = null;
        /**
         * Keeps track of the async client initialization.
         * When null or not yet resolved the auth state is `unknown`
         * Once resolved the auth state is known and it's safe to call any further client methods.
         * Keep extra care to never reject or throw uncaught errors
         */ this.initializePromise = null;
        this.detectSessionInUrl = true;
        this.hasCustomAuthorizationHeader = false;
        this.suppressGetSessionWarning = false;
        this.lockAcquired = false;
        this.pendingInLock = [];
        /**
         * Used to broadcast state change events to other tabs listening.
         */ this.broadcastChannel = null;
        this.logger = console.log;
        const settings = Object.assign(Object.assign({}, $9319d2e9f8204577$var$DEFAULT_OPTIONS), options);
        this.storageKey = settings.storageKey;
        this.instanceID = (_a = $9319d2e9f8204577$var$GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
        $9319d2e9f8204577$var$GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
        this.logDebugMessages = !!settings.debug;
        if (typeof settings.debug === 'function') this.logger = settings.debug;
        if (this.instanceID > 0 && (0, $96f7b0006107f2ac$export$4e09c449d6c407f7)()) {
            const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
            console.warn(message);
            if (this.logDebugMessages) console.trace(message);
        }
        this.persistSession = settings.persistSession;
        this.autoRefreshToken = settings.autoRefreshToken;
        this.admin = new (0, $ff481397fb5f7271$export$2e2bcd8739ae039)({
            url: settings.url,
            headers: settings.headers,
            fetch: settings.fetch
        });
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = (0, $96f7b0006107f2ac$export$98d92b1aa79f8cc7)(settings.fetch);
        this.lock = settings.lock || $9319d2e9f8204577$var$lockNoOp;
        this.detectSessionInUrl = settings.detectSessionInUrl;
        this.flowType = settings.flowType;
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
        this.throwOnError = settings.throwOnError;
        if (settings.lock) this.lock = settings.lock;
        else if (this.persistSession && (0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) this.lock = (0, $8d234999934c9269$export$f4ff21938fb7af3c);
        else this.lock = $9319d2e9f8204577$var$lockNoOp;
        if (!this.jwks) {
            this.jwks = {
                keys: []
            };
            this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
        }
        this.mfa = {
            verify: this._verify.bind(this),
            enroll: this._enroll.bind(this),
            unenroll: this._unenroll.bind(this),
            challenge: this._challenge.bind(this),
            listFactors: this._listFactors.bind(this),
            challengeAndVerify: this._challengeAndVerify.bind(this),
            getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
            webauthn: new (0, $5258140a77314b98$export$23264e48ebb7dee0)(this)
        };
        this.oauth = {
            getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
            approveAuthorization: this._approveAuthorization.bind(this),
            denyAuthorization: this._denyAuthorization.bind(this),
            listGrants: this._listOAuthGrants.bind(this),
            revokeGrant: this._revokeOAuthGrant.bind(this)
        };
        if (this.persistSession) {
            if (settings.storage) this.storage = settings.storage;
            else if ((0, $96f7b0006107f2ac$export$9ec034ee80211814)()) this.storage = globalThis.localStorage;
            else {
                this.memoryStorage = {};
                this.storage = (0, $2cd39220df7b9b0b$export$d791f66d7e5710cf)(this.memoryStorage);
            }
            if (settings.userStorage) this.userStorage = settings.userStorage;
        } else {
            this.memoryStorage = {};
            this.storage = (0, $2cd39220df7b9b0b$export$d791f66d7e5710cf)(this.memoryStorage);
        }
        if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
                this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            } catch (e) {
                console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
            }
            (_c = this.broadcastChannel) === null || _c === void 0 || _c.addEventListener('message', async (event)=>{
                this._debug('received broadcast notification from other tab or client', event);
                await this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
            });
        }
        this.initialize();
    }
    /**
     * Returns whether error throwing mode is enabled for this client.
     */ isThrowOnErrorEnabled() {
        return this.throwOnError;
    }
    /**
     * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
     * and the provided result contains a non-nullish error, the error is thrown instead of
     * being returned. This ensures consistent behavior across all public API methods.
     */ _returnResult(result) {
        if (this.throwOnError && result && result.error) throw result.error;
        return result;
    }
    _logPrefix() {
        return 'GoTrueClient@' + `${this.storageKey}:${this.instanceID} (${0, $1b4c7f01677a4759$export$83d89fbfd8236492}) ${new Date().toISOString()}`;
    }
    _debug(...args) {
        if (this.logDebugMessages) this.logger(this._logPrefix(), ...args);
        return this;
    }
    /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */ async initialize() {
        if (this.initializePromise) return await this.initializePromise;
        this.initializePromise = (async ()=>{
            return await this._acquireLock(-1, async ()=>{
                return await this._initialize();
            });
        })();
        return await this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */ async _initialize() {
        var _a;
        try {
            let params = {};
            let callbackUrlType = 'none';
            if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)()) {
                params = (0, $96f7b0006107f2ac$export$7a29392fb778224c)(window.location.href);
                if (this._isImplicitGrantCallback(params)) callbackUrlType = 'implicit';
                else if (await this._isPKCECallback(params)) callbackUrlType = 'pkce';
            }
            /**
             * Attempt to get the session from the URL only if these conditions are fulfilled
             *
             * Note: If the URL isn't one of the callback url types (implicit or pkce),
             * then there could be an existing session so we don't want to prematurely remove it
             */ if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && this.detectSessionInUrl && callbackUrlType !== 'none') {
                const { data: data, error: error } = await this._getSessionFromURL(params, callbackUrlType);
                if (error) {
                    this._debug('#_initialize()', 'error detecting session from URL', error);
                    if ((0, $47f551231c4752e9$export$45edea3999507afd)(error)) {
                        const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                        if (errorCode === 'identity_already_exists' || errorCode === 'identity_not_found' || errorCode === 'single_identity_not_deletable') return {
                            error: error
                        };
                    }
                    // failed login attempt via url,
                    // remove old session as in verifyOtp, signUp and signInWith*
                    await this._removeSession();
                    return {
                        error: error
                    };
                }
                const { session: session, redirectType: redirectType } = data;
                this._debug('#_initialize()', 'detected session in URL', session, 'redirect type', redirectType);
                await this._saveSession(session);
                setTimeout(async ()=>{
                    if (redirectType === 'recovery') await this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                    else await this._notifyAllSubscribers('SIGNED_IN', session);
                }, 0);
                return {
                    error: null
                };
            }
            // no login attempt via callback url try to recover session from storage
            await this._recoverAndRefresh();
            return {
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                error: error
            });
            return this._returnResult({
                error: new (0, $47f551231c4752e9$export$f7559805d4a50078)('Unexpected error during initialization', error)
            });
        } finally{
            await this._handleVisibilityChange();
            this._debug('#_initialize()', 'end');
        }
    }
    /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */ async signInAnonymously(credentials) {
        var _a, _b, _c;
        try {
            const res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/signup`, {
                headers: this.headers,
                body: {
                    data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
                    gotrue_meta_security: {
                        captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken
                    }
                },
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            const { data: data, error: error } = res;
            if (error || !data) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({
                data: {
                    user: user,
                    session: session
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */ async signUp(credentials) {
        var _a, _b, _c;
        try {
            let res;
            if ('email' in credentials) {
                const { email: email, password: password, options: options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey);
                res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: {
                        email: email,
                        password: password,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod
                    },
                    xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
                });
            } else if ('phone' in credentials) {
                const { phone: phone, password: password, options: options } = credentials;
                res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    body: {
                        phone: phone,
                        password: password,
                        data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                        channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    },
                    xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
                });
            } else throw new (0, $47f551231c4752e9$export$9ef583f0381b4cc)('You must provide either an email or phone number and a password');
            const { data: data, error: error } = res;
            if (error || !data) {
                await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
            }
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({
                data: {
                    user: user,
                    session: session
                },
                error: null
            });
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */ async signInWithPassword(credentials) {
        try {
            let res;
            if ('email' in credentials) {
                const { email: email, password: password, options: options } = credentials;
                res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        email: email,
                        password: password,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    },
                    xform: (0, $041cf3bbe560a6d3$export$db83aade1c2922c7)
                });
            } else if ('phone' in credentials) {
                const { phone: phone, password: password, options: options } = credentials;
                res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        phone: phone,
                        password: password,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    },
                    xform: (0, $041cf3bbe560a6d3$export$db83aade1c2922c7)
                });
            } else throw new (0, $47f551231c4752e9$export$9ef583f0381b4cc)('You must provide either an email or phone number and a password');
            const { data: data, error: error } = res;
            if (error) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            else if (!data || !data.session || !data.user) {
                const invalidTokenError = new (0, $47f551231c4752e9$export$7e277b620449c1b4)();
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: invalidTokenError
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: Object.assign({
                    user: data.user,
                    session: data.session
                }, data.weak_password ? {
                    weakPassword: data.weak_password
                } : null),
                error: error
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */ async signInWithOAuth(credentials) {
        var _a, _b, _c, _d;
        return await this._handleProviderSignIn(credentials.provider, {
            redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect
        });
    }
    /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */ async exchangeCodeForSession(authCode) {
        await this.initializePromise;
        return this._acquireLock(-1, async ()=>{
            return this._exchangeCodeForSession(authCode);
        });
    }
    /**
     * Signs in a user by verifying a message signed by the user's private key.
     * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
     * both of which derive from the EIP-4361 standard
     * With slight variation on Solana's side.
     * @reference https://eips.ethereum.org/EIPS/eip-4361
     */ async signInWithWeb3(credentials) {
        const { chain: chain } = credentials;
        switch(chain){
            case 'ethereum':
                return await this.signInWithEthereum(credentials);
            case 'solana':
                return await this.signInWithSolana(credentials);
            default:
                throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
        }
    }
    async signInWithEthereum(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // TODO: flatten type
        let message;
        let signature;
        if ('message' in credentials) {
            message = credentials.message;
            signature = credentials.signature;
        } else {
            const { chain: chain, wallet: wallet, statement: statement, options: options } = credentials;
            let resolvedWallet;
            if (!(0, $96f7b0006107f2ac$export$4e09c449d6c407f7)()) {
                if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                resolvedWallet = wallet;
            } else if (typeof wallet === 'object') resolvedWallet = wallet;
            else {
                const windowAny = window;
                if ('ethereum' in windowAny && typeof windowAny.ethereum === 'object' && 'request' in windowAny.ethereum && typeof windowAny.ethereum.request === 'function') resolvedWallet = windowAny.ethereum;
                else throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
            }
            const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
            const accounts = await resolvedWallet.request({
                method: 'eth_requestAccounts'
            }).then((accs)=>accs).catch(()=>{
                throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
            });
            if (!accounts || accounts.length === 0) throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
            const address = (0, $f8ddd15b1bf1e8fe$export$88411125f012957a)(accounts[0]);
            let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
            if (!chainId) {
                const chainIdHex = await resolvedWallet.request({
                    method: 'eth_chainId'
                });
                chainId = (0, $f8ddd15b1bf1e8fe$export$1a8ceedbd5845648)(chainIdHex);
            }
            const siweMessage = {
                domain: url.host,
                address: address,
                statement: statement,
                uri: url.href,
                version: '1',
                chainId: chainId,
                nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
                issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : new Date(),
                expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
                notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
                requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
                resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources
            };
            message = (0, $f8ddd15b1bf1e8fe$export$7ee2e5fde403d4c8)(siweMessage);
            // Sign message
            signature = await resolvedWallet.request({
                method: 'personal_sign',
                params: [
                    (0, $f8ddd15b1bf1e8fe$export$7ea66e3774a60b67)(message),
                    address
                ]
            });
        }
        try {
            const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                headers: this.headers,
                body: Object.assign({
                    chain: 'ethereum',
                    message: message,
                    signature: signature
                }, ((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken) ? {
                    gotrue_meta_security: {
                        captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken
                    }
                } : null),
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            if (error) throw error;
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new (0, $47f551231c4752e9$export$7e277b620449c1b4)();
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: invalidTokenError
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: Object.assign({}, data),
                error: error
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    async signInWithSolana(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        let message;
        let signature;
        if ('message' in credentials) {
            message = credentials.message;
            signature = credentials.signature;
        } else {
            const { chain: chain, wallet: wallet, statement: statement, options: options } = credentials;
            let resolvedWallet;
            if (!(0, $96f7b0006107f2ac$export$4e09c449d6c407f7)()) {
                if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                resolvedWallet = wallet;
            } else if (typeof wallet === 'object') resolvedWallet = wallet;
            else {
                const windowAny = window;
                if ('solana' in windowAny && typeof windowAny.solana === 'object' && ('signIn' in windowAny.solana && typeof windowAny.solana.signIn === 'function' || 'signMessage' in windowAny.solana && typeof windowAny.solana.signMessage === 'function')) resolvedWallet = windowAny.solana;
                else throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
            }
            const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
            if ('signIn' in resolvedWallet && resolvedWallet.signIn) {
                const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({
                    issuedAt: new Date().toISOString()
                }, options === null || options === void 0 ? void 0 : options.signInWithSolana), {
                    // non-overridable properties
                    version: '1',
                    domain: url.host,
                    uri: url.href
                }), statement ? {
                    statement: statement
                } : null));
                let outputToProcess;
                if (Array.isArray(output) && output[0] && typeof output[0] === 'object') outputToProcess = output[0];
                else if (output && typeof output === 'object' && 'signedMessage' in output && 'signature' in output) outputToProcess = output;
                else throw new Error('@supabase/auth-js: Wallet method signIn() returned unrecognized value');
                if ('signedMessage' in outputToProcess && 'signature' in outputToProcess && (typeof outputToProcess.signedMessage === 'string' || outputToProcess.signedMessage instanceof Uint8Array) && outputToProcess.signature instanceof Uint8Array) {
                    message = typeof outputToProcess.signedMessage === 'string' ? outputToProcess.signedMessage : new TextDecoder().decode(outputToProcess.signedMessage);
                    signature = outputToProcess.signature;
                } else throw new Error('@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields');
            } else {
                if (!('signMessage' in resolvedWallet) || typeof resolvedWallet.signMessage !== 'function' || !('publicKey' in resolvedWallet) || typeof resolvedWallet !== 'object' || !resolvedWallet.publicKey || !('toBase58' in resolvedWallet.publicKey) || typeof resolvedWallet.publicKey.toBase58 !== 'function') throw new Error('@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API');
                message = [
                    `${url.host} wants you to sign in with your Solana account:`,
                    resolvedWallet.publicKey.toBase58(),
                    ...statement ? [
                        '',
                        statement,
                        ''
                    ] : [
                        ''
                    ],
                    'Version: 1',
                    `URI: ${url.href}`,
                    `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : new Date().toISOString()}`,
                    ...((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore) ? [
                        `Not Before: ${options.signInWithSolana.notBefore}`
                    ] : [],
                    ...((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime) ? [
                        `Expiration Time: ${options.signInWithSolana.expirationTime}`
                    ] : [],
                    ...((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId) ? [
                        `Chain ID: ${options.signInWithSolana.chainId}`
                    ] : [],
                    ...((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [
                        `Nonce: ${options.signInWithSolana.nonce}`
                    ] : [],
                    ...((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId) ? [
                        `Request ID: ${options.signInWithSolana.requestId}`
                    ] : [],
                    ...((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length) ? [
                        'Resources',
                        ...options.signInWithSolana.resources.map((resource)=>`- ${resource}`)
                    ] : []
                ].join('\n');
                const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), 'utf8');
                if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) throw new Error('@supabase/auth-js: Wallet signMessage() API returned an recognized value');
                signature = maybeSignature;
            }
        }
        try {
            const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                headers: this.headers,
                body: Object.assign({
                    chain: 'solana',
                    message: message,
                    signature: (0, $5c1fd3f86e5f2223$export$3f156efe462a835e)(signature)
                }, ((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken) ? {
                    gotrue_meta_security: {
                        captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken
                    }
                } : null),
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            if (error) throw error;
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new (0, $47f551231c4752e9$export$7e277b620449c1b4)();
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: invalidTokenError
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: Object.assign({}, data),
                error: error
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    async _exchangeCodeForSession(authCode) {
        const storageItem = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.storage, `${this.storageKey}-code-verifier`);
        const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : '').split('/');
        try {
            if (!codeVerifier && this.flowType === 'pkce') throw new (0, $47f551231c4752e9$export$11e8e15400b7b336)();
            const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                headers: this.headers,
                body: {
                    auth_code: authCode,
                    code_verifier: codeVerifier
                },
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if (error) throw error;
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new (0, $47f551231c4752e9$export$7e277b620449c1b4)();
                return this._returnResult({
                    data: {
                        user: null,
                        session: null,
                        redirectType: null
                    },
                    error: invalidTokenError
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: Object.assign(Object.assign({}, data), {
                    redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null
                }),
                error: error
            });
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null,
                    redirectType: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */ async signInWithIdToken(credentials) {
        try {
            const { options: options, provider: provider, token: token, access_token: access_token, nonce: nonce } = credentials;
            const res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                headers: this.headers,
                body: {
                    provider: provider,
                    id_token: token,
                    access_token: access_token,
                    nonce: nonce,
                    gotrue_meta_security: {
                        captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                    }
                },
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            const { data: data, error: error } = res;
            if (error) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            else if (!data || !data.session || !data.user) {
                const invalidTokenError = new (0, $47f551231c4752e9$export$7e277b620449c1b4)();
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: invalidTokenError
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: data,
                error: error
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */ async signInWithOtp(credentials) {
        var _a, _b, _c, _d, _e;
        try {
            if ('email' in credentials) {
                const { email: email, options: options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey);
                const { error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        email: email,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
                });
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
            }
            if ('phone' in credentials) {
                const { phone: phone, options: options } = credentials;
                const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        phone: phone,
                        data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                        create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        },
                        channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms'
                    }
                });
                return this._returnResult({
                    data: {
                        user: null,
                        session: null,
                        messageId: data === null || data === void 0 ? void 0 : data.message_id
                    },
                    error: error
                });
            }
            throw new (0, $47f551231c4752e9$export$9ef583f0381b4cc)('You must provide either an email or phone number.');
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */ async verifyOtp(params) {
        var _a, _b;
        try {
            let redirectTo = undefined;
            let captchaToken = undefined;
            if ('options' in params) {
                redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
                captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
            }
            const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/verify`, {
                headers: this.headers,
                body: Object.assign(Object.assign({}, params), {
                    gotrue_meta_security: {
                        captcha_token: captchaToken
                    }
                }),
                redirectTo: redirectTo,
                xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
            });
            if (error) throw error;
            if (!data) {
                const tokenVerificationError = new Error('An error occurred on token verification.');
                throw tokenVerificationError;
            }
            const session = data.session;
            const user = data.user;
            if (session === null || session === void 0 ? void 0 : session.access_token) {
                await this._saveSession(session);
                await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
            }
            return this._returnResult({
                data: {
                    user: user,
                    session: session
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */ async signInWithSSO(params) {
        var _a, _b, _c, _d, _e;
        try {
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === 'pkce') [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey);
            const result = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/sso`, {
                body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, 'providerId' in params ? {
                    provider_id: params.providerId
                } : null), 'domain' in params ? {
                    domain: params.domain
                } : null), {
                    redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined
                }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? {
                    gotrue_meta_security: {
                        captcha_token: params.options.captchaToken
                    }
                } : null), {
                    skip_http_redirect: true,
                    code_challenge: codeChallenge,
                    code_challenge_method: codeChallengeMethod
                }),
                headers: this.headers,
                xform: (0, $041cf3bbe560a6d3$export$b04785c46dcd8f8b)
            });
            // Automatically redirect in browser unless skipBrowserRedirect is true
            if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && (0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) window.location.assign(result.data.url);
            return this._returnResult(result);
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */ async reauthenticate() {
        await this.initializePromise;
        return await this._acquireLock(-1, async ()=>{
            return await this._reauthenticate();
        });
    }
    async _reauthenticate() {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) throw sessionError;
                if (!session) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
                const { error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                    headers: this.headers,
                    jwt: session.access_token
                });
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */ async resend(credentials) {
        try {
            const endpoint = `${this.url}/resend`;
            if ('email' in credentials) {
                const { email: email, type: type, options: options } = credentials;
                const { error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        email: email,
                        type: type,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
                });
                return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
            } else if ('phone' in credentials) {
                const { phone: phone, type: type, options: options } = credentials;
                const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        phone: phone,
                        type: type,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    }
                });
                return this._returnResult({
                    data: {
                        user: null,
                        session: null,
                        messageId: data === null || data === void 0 ? void 0 : data.message_id
                    },
                    error: error
                });
            }
            throw new (0, $47f551231c4752e9$export$9ef583f0381b4cc)('You must provide either an email or phone number and a type');
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */ async getSession() {
        await this.initializePromise;
        const result = await this._acquireLock(-1, async ()=>{
            return this._useSession(async (result)=>{
                return result;
            });
        });
        return result;
    }
    /**
     * Acquires a global lock based on the storage key.
     */ async _acquireLock(acquireTimeout, fn) {
        this._debug('#_acquireLock', 'begin', acquireTimeout);
        try {
            if (this.lockAcquired) {
                const last = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve();
                const result = (async ()=>{
                    await last;
                    return await fn();
                })();
                this.pendingInLock.push((async ()=>{
                    try {
                        await result;
                    } catch (e) {
                    // we just care if it finished
                    }
                })());
                return result;
            }
            return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async ()=>{
                this._debug('#_acquireLock', 'lock acquired for storage key', this.storageKey);
                try {
                    this.lockAcquired = true;
                    const result = fn();
                    this.pendingInLock.push((async ()=>{
                        try {
                            await result;
                        } catch (e) {
                        // we just care if it finished
                        }
                    })());
                    await result;
                    // keep draining the queue until there's nothing to wait on
                    while(this.pendingInLock.length){
                        const waitOn = [
                            ...this.pendingInLock
                        ];
                        await Promise.all(waitOn);
                        this.pendingInLock.splice(0, waitOn.length);
                    }
                    return await result;
                } finally{
                    this._debug('#_acquireLock', 'lock released for storage key', this.storageKey);
                    this.lockAcquired = false;
                }
            });
        } finally{
            this._debug('#_acquireLock', 'end');
        }
    }
    /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */ async _useSession(fn) {
        this._debug('#_useSession', 'begin');
        try {
            // the use of __loadSession here is the only correct use of the function!
            const result = await this.__loadSession();
            return await fn(result);
        } finally{
            this._debug('#_useSession', 'end');
        }
    }
    /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */ async __loadSession() {
        this._debug('#__loadSession()', 'begin');
        if (!this.lockAcquired) this._debug('#__loadSession()', 'used outside of an acquired lock!', new Error().stack);
        try {
            let currentSession = null;
            const maybeSession = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.storage, this.storageKey);
            this._debug('#getSession()', 'session from storage', maybeSession);
            if (maybeSession !== null) {
                if (this._isValidSession(maybeSession)) currentSession = maybeSession;
                else {
                    this._debug('#getSession()', 'session from storage is not valid');
                    await this._removeSession();
                }
            }
            if (!currentSession) return {
                data: {
                    session: null
                },
                error: null
            };
            // A session is considered expired before the access token _actually_
            // expires. When the autoRefreshToken option is off (or when the tab is
            // in the background), very eager users of getSession() -- like
            // realtime-js -- might send a valid JWT which will expire by the time it
            // reaches the server.
            const hasExpired = currentSession.expires_at ? currentSession.expires_at * 1000 - Date.now() < (0, $79e77f61ec218cd7$export$a36ad0026e55ac00) : false;
            this._debug('#__loadSession()', `session has${hasExpired ? '' : ' not'} expired`, 'expires_at', currentSession.expires_at);
            if (!hasExpired) {
                if (this.userStorage) {
                    const maybeUser = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.userStorage, this.storageKey + '-user');
                    if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) currentSession.user = maybeUser.user;
                    else currentSession.user = (0, $96f7b0006107f2ac$export$52c7f0d8a78626b)();
                }
                // Wrap the user object with a warning proxy on the server
                // This warns when properties of the user are accessed, not when session.user itself is accessed
                if (this.storage.isServer && currentSession.user && !currentSession.user.__isUserNotAvailableProxy) {
                    const suppressWarningRef = {
                        value: this.suppressGetSessionWarning
                    };
                    currentSession.user = (0, $96f7b0006107f2ac$export$28f3a5de6111309a)(currentSession.user, suppressWarningRef);
                    // Update the client-level suppression flag when the proxy suppresses the warning
                    if (suppressWarningRef.value) this.suppressGetSessionWarning = true;
                }
                return {
                    data: {
                        session: currentSession
                    },
                    error: null
                };
            }
            const { data: session, error: error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) return this._returnResult({
                data: {
                    session: null
                },
                error: error
            });
            return this._returnResult({
                data: {
                    session: session
                },
                error: null
            });
        } finally{
            this._debug('#__loadSession()', 'end');
        }
    }
    /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */ async getUser(jwt) {
        if (jwt) return await this._getUser(jwt);
        await this.initializePromise;
        const result = await this._acquireLock(-1, async ()=>{
            return await this._getUser();
        });
        if (result.data.user) this.suppressGetSessionWarning = true;
        return result;
    }
    async _getUser(jwt) {
        try {
            if (jwt) return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/user`, {
                headers: this.headers,
                jwt: jwt,
                xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
            });
            return await this._useSession(async (result)=>{
                var _a, _b, _c;
                const { data: data, error: error } = result;
                if (error) throw error;
                // returns an error if there is no access_token or custom authorization header
                if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) return {
                    data: {
                        user: null
                    },
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                };
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : undefined,
                    xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) {
                if ((0, $47f551231c4752e9$export$3e849aa4db565c1d)(error)) {
                    // JWT contains a `session_id` which does not correspond to an active
                    // session in the database, indicating the user is signed out.
                    await this._removeSession();
                    await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
                }
                return this._returnResult({
                    data: {
                        user: null
                    },
                    error: error
                });
            }
            throw error;
        }
    }
    /**
     * Updates user data for a logged in user.
     */ async updateUser(attributes, options = {}) {
        await this.initializePromise;
        return await this._acquireLock(-1, async ()=>{
            return await this._updateUser(attributes, options);
        });
    }
    async _updateUser(attributes, options = {}) {
        try {
            return await this._useSession(async (result)=>{
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) throw sessionError;
                if (!sessionData.session) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
                const session = sessionData.session;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce' && attributes.email != null) [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey);
                const { data: data, error: userError } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'PUT', `${this.url}/user`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: Object.assign(Object.assign({}, attributes), {
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod
                    }),
                    jwt: session.access_token,
                    xform: (0, $041cf3bbe560a6d3$export$e20f488897843593)
                });
                if (userError) throw userError;
                session.user = data.user;
                await this._saveSession(session);
                await this._notifyAllSubscribers('USER_UPDATED', session);
                return this._returnResult({
                    data: {
                        user: session.user
                    },
                    error: null
                });
            });
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */ async setSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async ()=>{
            return await this._setSession(currentSession);
        });
    }
    async _setSession(currentSession) {
        try {
            if (!currentSession.access_token || !currentSession.refresh_token) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
            const timeNow = Date.now() / 1000;
            let expiresAt = timeNow;
            let hasExpired = true;
            let session = null;
            const { payload: payload } = (0, $96f7b0006107f2ac$export$9a62e6c0a30e00bc)(currentSession.access_token);
            if (payload.exp) {
                expiresAt = payload.exp;
                hasExpired = expiresAt <= timeNow;
            }
            if (hasExpired) {
                const { data: refreshedSession, error: error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
                if (!refreshedSession) return {
                    data: {
                        user: null,
                        session: null
                    },
                    error: null
                };
                session = refreshedSession;
            } else {
                const { data: data, error: error } = await this._getUser(currentSession.access_token);
                if (error) throw error;
                session = {
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token,
                    user: data.user,
                    token_type: 'bearer',
                    expires_in: expiresAt - timeNow,
                    expires_at: expiresAt
                };
                await this._saveSession(session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({
                data: {
                    user: session.user,
                    session: session
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    session: null,
                    user: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */ async refreshSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(-1, async ()=>{
            return await this._refreshSession(currentSession);
        });
    }
    async _refreshSession(currentSession) {
        try {
            return await this._useSession(async (result)=>{
                var _a;
                if (!currentSession) {
                    const { data: data, error: error } = result;
                    if (error) throw error;
                    currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                }
                if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
                const { data: session, error: error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
                if (!session) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: null
                });
                return this._returnResult({
                    data: {
                        user: session.user,
                        session: session
                    },
                    error: null
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    user: null,
                    session: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Gets the session data from a URL string
     */ async _getSessionFromURL(params, callbackUrlType) {
        try {
            if (!(0, $96f7b0006107f2ac$export$4e09c449d6c407f7)()) throw new (0, $47f551231c4752e9$export$bf5df8e043856ef5)('No browser detected.');
            // If there's an error in the URL, it doesn't matter what flow it is, we just return the error.
            if (params.error || params.error_description || params.error_code) // The error class returned implies that the redirect is from an implicit grant flow
            // but it could also be from a redirect error from a PKCE flow.
            throw new (0, $47f551231c4752e9$export$bf5df8e043856ef5)(params.error_description || 'Error in URL with unspecified error_description', {
                error: params.error || 'unspecified_error',
                code: params.error_code || 'unspecified_code'
            });
            // Checks for mismatches between the flowType initialised in the client and the URL parameters
            switch(callbackUrlType){
                case 'implicit':
                    if (this.flowType === 'pkce') throw new (0, $47f551231c4752e9$export$39583657eb2a7027)('Not a valid PKCE flow url.');
                    break;
                case 'pkce':
                    if (this.flowType === 'implicit') throw new (0, $47f551231c4752e9$export$bf5df8e043856ef5)('Not a valid implicit grant flow url.');
                    break;
                default:
            }
            // Since this is a redirect for PKCE, we attempt to retrieve the code from the URL for the code exchange
            if (callbackUrlType === 'pkce') {
                this._debug('#_initialize()', 'begin', 'is PKCE flow', true);
                if (!params.code) throw new (0, $47f551231c4752e9$export$39583657eb2a7027)('No code detected.');
                const { data: data, error: error } = await this._exchangeCodeForSession(params.code);
                if (error) throw error;
                const url = new URL(window.location.href);
                url.searchParams.delete('code');
                window.history.replaceState(window.history.state, '', url.toString());
                return {
                    data: {
                        session: data.session,
                        redirectType: null
                    },
                    error: null
                };
            }
            const { provider_token: provider_token, provider_refresh_token: provider_refresh_token, access_token: access_token, refresh_token: refresh_token, expires_in: expires_in, expires_at: expires_at, token_type: token_type } = params;
            if (!access_token || !expires_in || !refresh_token || !token_type) throw new (0, $47f551231c4752e9$export$bf5df8e043856ef5)('No session defined in URL');
            const timeNow = Math.round(Date.now() / 1000);
            const expiresIn = parseInt(expires_in);
            let expiresAt = timeNow + expiresIn;
            if (expires_at) expiresAt = parseInt(expires_at);
            const actuallyExpiresIn = expiresAt - timeNow;
            if (actuallyExpiresIn * 1000 <= (0, $79e77f61ec218cd7$export$a4558fee79d6c8ae)) console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
            const issuedAt = expiresAt - expiresIn;
            if (timeNow - issuedAt >= 120) console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale', issuedAt, expiresAt, timeNow);
            else if (timeNow - issuedAt < 0) console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew', issuedAt, expiresAt, timeNow);
            const { data: data, error: error } = await this._getUser(access_token);
            if (error) throw error;
            const session = {
                provider_token: provider_token,
                provider_refresh_token: provider_refresh_token,
                access_token: access_token,
                expires_in: expiresIn,
                expires_at: expiresAt,
                refresh_token: refresh_token,
                token_type: token_type,
                user: data.user
            };
            // Remove tokens from URL
            window.location.hash = '';
            this._debug('#_getSessionFromURL()', 'clearing window.location.hash');
            return this._returnResult({
                data: {
                    session: session,
                    redirectType: params.type
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    session: null,
                    redirectType: null
                },
                error: error
            });
            throw error;
        }
    }
    /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     *
     * If `detectSessionInUrl` is a function, it will be called with the URL and params to determine
     * if the URL should be processed as a Supabase auth callback. This allows users to exclude
     * URLs from other OAuth providers (e.g., Facebook Login) that also return access_token in the fragment.
     */ _isImplicitGrantCallback(params) {
        if (typeof this.detectSessionInUrl === 'function') return this.detectSessionInUrl(new URL(window.location.href), params);
        return Boolean(params.access_token || params.error_description);
    }
    /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */ async _isPKCECallback(params) {
        const currentStorageContent = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.storage, `${this.storageKey}-code-verifier`);
        return !!(params.code && currentStorageContent);
    }
    /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */ async signOut(options = {
        scope: 'global'
    }) {
        await this.initializePromise;
        return await this._acquireLock(-1, async ()=>{
            return await this._signOut(options);
        });
    }
    async _signOut({ scope: scope } = {
        scope: 'global'
    }) {
        return await this._useSession(async (result)=>{
            var _a;
            const { data: data, error: sessionError } = result;
            if (sessionError) return this._returnResult({
                error: sessionError
            });
            const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
            if (accessToken) {
                const { error: error } = await this.admin.signOut(accessToken, scope);
                if (error) {
                    // ignore 404s since user might not exist anymore
                    // ignore 401s since an invalid or expired JWT should sign out the current session
                    if (!((0, $47f551231c4752e9$export$4fe744aeb810d543)(error) && (error.status === 404 || error.status === 401 || error.status === 403))) return this._returnResult({
                        error: error
                    });
                }
            }
            if (scope !== 'others') {
                await this._removeSession();
                await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            }
            return this._returnResult({
                error: null
            });
        });
    }
    onAuthStateChange(callback) {
        const id = (0, $96f7b0006107f2ac$export$16db4ce6a8dfc285)();
        const subscription = {
            id: id,
            callback: callback,
            unsubscribe: ()=>{
                this._debug('#unsubscribe()', 'state change callback with id removed', id);
                this.stateChangeEmitters.delete(id);
            }
        };
        this._debug('#onAuthStateChange()', 'registered callback with id', id);
        this.stateChangeEmitters.set(id, subscription);
        (async ()=>{
            await this.initializePromise;
            await this._acquireLock(-1, async ()=>{
                this._emitInitialSession(id);
            });
        })();
        return {
            data: {
                subscription: subscription
            }
        };
    }
    async _emitInitialSession(id) {
        return await this._useSession(async (result)=>{
            var _a, _b;
            try {
                const { data: { session: session }, error: error } = result;
                if (error) throw error;
                await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                this._debug('INITIAL_SESSION', 'callback id', id, 'session', session);
            } catch (err) {
                await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                this._debug('INITIAL_SESSION', 'callback id', id, 'error', err);
                console.error(err);
            }
        });
    }
    /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */ async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === 'pkce') [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey, true // isPasswordRecovery
        );
        try {
            return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/recover`, {
                body: {
                    email: email,
                    code_challenge: codeChallenge,
                    code_challenge_method: codeChallengeMethod,
                    gotrue_meta_security: {
                        captcha_token: options.captchaToken
                    }
                },
                headers: this.headers,
                redirectTo: options.redirectTo
            });
        } catch (error) {
            await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Gets all the identities linked to a user.
     */ async getUserIdentities() {
        var _a;
        try {
            const { data: data, error: error } = await this.getUser();
            if (error) throw error;
            return this._returnResult({
                data: {
                    identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : []
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    async linkIdentity(credentials) {
        if ('token' in credentials) return this.linkIdentityIdToken(credentials);
        return this.linkIdentityOAuth(credentials);
    }
    async linkIdentityOAuth(credentials) {
        var _a;
        try {
            const { data: data, error: error } = await this._useSession(async (result)=>{
                var _a, _b, _c, _d, _e;
                const { data: data, error: error } = result;
                if (error) throw error;
                const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
                    redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                    scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                    queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                    skipBrowserRedirect: true
                });
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', url, {
                    headers: this.headers,
                    jwt: (_e = (_d = data.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : undefined
                });
            });
            if (error) throw error;
            if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) window.location.assign(data === null || data === void 0 ? void 0 : data.url);
            return this._returnResult({
                data: {
                    provider: credentials.provider,
                    url: data === null || data === void 0 ? void 0 : data.url
                },
                error: null
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    provider: credentials.provider,
                    url: null
                },
                error: error
            });
            throw error;
        }
    }
    async linkIdentityIdToken(credentials) {
        return await this._useSession(async (result)=>{
            var _a;
            try {
                const { error: sessionError, data: { session: session } } = result;
                if (sessionError) throw sessionError;
                const { options: options, provider: provider, token: token, access_token: access_token, nonce: nonce } = credentials;
                const res = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                    headers: this.headers,
                    jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : undefined,
                    body: {
                        provider: provider,
                        id_token: token,
                        access_token: access_token,
                        nonce: nonce,
                        link_identity: true,
                        gotrue_meta_security: {
                            captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken
                        }
                    },
                    xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
                });
                const { data: data, error: error } = res;
                if (error) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
                else if (!data || !data.session || !data.user) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: new (0, $47f551231c4752e9$export$7e277b620449c1b4)()
                });
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('USER_UPDATED', data.session);
                }
                return this._returnResult({
                    data: data,
                    error: error
                });
            } catch (error) {
                await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
                if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                    data: {
                        user: null,
                        session: null
                    },
                    error: error
                });
                throw error;
            }
        });
    }
    /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */ async unlinkIdentity(identity) {
        try {
            return await this._useSession(async (result)=>{
                var _a, _b;
                const { data: data, error: error } = result;
                if (error) throw error;
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/user/identities/${identity.identity_id}`, {
                    headers: this.headers,
                    jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */ async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            const startedAt = Date.now();
            // will attempt to refresh the token with exponential backoff
            return await (0, $96f7b0006107f2ac$export$9e1b8e833f44ff21)(async (attempt)=>{
                if (attempt > 0) await (0, $96f7b0006107f2ac$export$e772c8ff12451969)(200 * Math.pow(2, attempt - 1)); // 200, 400, 800, ...
                this._debug(debugName, 'refreshing attempt', attempt);
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                    body: {
                        refresh_token: refreshToken
                    },
                    headers: this.headers,
                    xform: (0, $041cf3bbe560a6d3$export$273fe4673a018c2e)
                });
            }, (attempt, error)=>{
                const nextBackOffInterval = 200 * Math.pow(2, attempt);
                return error && (0, $47f551231c4752e9$export$a77af358da5fb874)(error) && // retryable only if the request can be sent before the backoff overflows the tick duration
                Date.now() + nextBackOffInterval - startedAt < (0, $79e77f61ec218cd7$export$a4558fee79d6c8ae);
            });
        } catch (error) {
            this._debug(debugName, 'error', error);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: {
                    session: null,
                    user: null
                },
                error: error
            });
            throw error;
        } finally{
            this._debug(debugName, 'end');
        }
    }
    _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === 'object' && maybeSession !== null && 'access_token' in maybeSession && 'refresh_token' in maybeSession && 'expires_at' in maybeSession;
        return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
            redirectTo: options.redirectTo,
            scopes: options.scopes,
            queryParams: options.queryParams
        });
        this._debug('#_handleProviderSignIn()', 'provider', provider, 'options', options, 'url', url);
        // try to open on the browser
        if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && !options.skipBrowserRedirect) window.location.assign(url);
        return {
            data: {
                provider: provider,
                url: url
            },
            error: null
        };
    }
    /**
     * Recovers the session from LocalStorage and refreshes the token
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */ async _recoverAndRefresh() {
        var _a, _b;
        const debugName = '#_recoverAndRefresh()';
        this._debug(debugName, 'begin');
        try {
            const currentSession = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.storage, this.storageKey);
            if (currentSession && this.userStorage) {
                let maybeUser = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.userStorage, this.storageKey + '-user');
                if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
                    // storage and userStorage are the same storage medium, for example
                    // window.localStorage if userStorage does not have the user from
                    // storage stored, store it first thereby migrating the user object
                    // from storage -> userStorage
                    maybeUser = {
                        user: currentSession.user
                    };
                    await (0, $96f7b0006107f2ac$export$e82c36d29078a87f)(this.userStorage, this.storageKey + '-user', maybeUser);
                }
                currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : (0, $96f7b0006107f2ac$export$52c7f0d8a78626b)();
            } else if (currentSession && !currentSession.user) // user storage is not set, let's check if it was previously enabled so
            // we bring back the storage as it should be
            {
                if (!currentSession.user) {
                    // test if userStorage was previously enabled and the storage medium was the same, to move the user back under the same key
                    const separateUser = await (0, $96f7b0006107f2ac$export$ba6fcb7c333d32c0)(this.storage, this.storageKey + '-user');
                    if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
                        currentSession.user = separateUser.user;
                        await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, this.storageKey + '-user');
                        await (0, $96f7b0006107f2ac$export$e82c36d29078a87f)(this.storage, this.storageKey, currentSession);
                    } else currentSession.user = (0, $96f7b0006107f2ac$export$52c7f0d8a78626b)();
                }
            }
            this._debug(debugName, 'session from storage', currentSession);
            if (!this._isValidSession(currentSession)) {
                this._debug(debugName, 'session is not valid');
                if (currentSession !== null) await this._removeSession();
                return;
            }
            const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1000 - Date.now() < (0, $79e77f61ec218cd7$export$a36ad0026e55ac00);
            this._debug(debugName, `session has${expiresWithMargin ? '' : ' not'} expired with margin of ${(0, $79e77f61ec218cd7$export$a36ad0026e55ac00)}s`);
            if (expiresWithMargin) {
                if (this.autoRefreshToken && currentSession.refresh_token) {
                    const { error: error } = await this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        console.error(error);
                        if (!(0, $47f551231c4752e9$export$a77af358da5fb874)(error)) {
                            this._debug(debugName, 'refresh failed with a non-retryable error, removing the session', error);
                            await this._removeSession();
                        }
                    }
                }
            } else if (currentSession.user && currentSession.user.__isUserNotAvailableProxy === true) // If we have a proxy user, try to get the real user data
            try {
                const { data: data, error: userError } = await this._getUser(currentSession.access_token);
                if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                    currentSession.user = data.user;
                    await this._saveSession(currentSession);
                    await this._notifyAllSubscribers('SIGNED_IN', currentSession);
                } else this._debug(debugName, 'could not get user data, skipping SIGNED_IN notification');
            } catch (getUserError) {
                console.error('Error getting user data:', getUserError);
                this._debug(debugName, 'error getting user data, skipping SIGNED_IN notification', getUserError);
            }
            else // no need to persist currentSession again, as we just loaded it from
            // local storage; persisting it again may overwrite a value saved by
            // another client with access to the same local storage
            await this._notifyAllSubscribers('SIGNED_IN', currentSession);
        } catch (err) {
            this._debug(debugName, 'error', err);
            console.error(err);
            return;
        } finally{
            this._debug(debugName, 'end');
        }
    }
    async _callRefreshToken(refreshToken) {
        var _a, _b;
        if (!refreshToken) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
        // refreshing is already in progress
        if (this.refreshingDeferred) return this.refreshingDeferred.promise;
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            this.refreshingDeferred = new (0, $96f7b0006107f2ac$export$85f6557964517f1a)();
            const { data: data, error: error } = await this._refreshAccessToken(refreshToken);
            if (error) throw error;
            if (!data.session) throw new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)();
            await this._saveSession(data.session);
            await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
            const result = {
                data: data.session,
                error: null
            };
            this.refreshingDeferred.resolve(result);
            return result;
        } catch (error) {
            this._debug(debugName, 'error', error);
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) {
                const result = {
                    data: null,
                    error: error
                };
                if (!(0, $47f551231c4752e9$export$a77af358da5fb874)(error)) await this._removeSession();
                (_a = this.refreshingDeferred) === null || _a === void 0 || _a.resolve(result);
                return result;
            }
            (_b = this.refreshingDeferred) === null || _b === void 0 || _b.reject(error);
            throw error;
        } finally{
            this.refreshingDeferred = null;
            this._debug(debugName, 'end');
        }
    }
    async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`;
        this._debug(debugName, 'begin', session, `broadcast = ${broadcast}`);
        try {
            if (this.broadcastChannel && broadcast) this.broadcastChannel.postMessage({
                event: event,
                session: session
            });
            const errors = [];
            const promises = Array.from(this.stateChangeEmitters.values()).map(async (x)=>{
                try {
                    await x.callback(event, session);
                } catch (e) {
                    errors.push(e);
                }
            });
            await Promise.all(promises);
            if (errors.length > 0) {
                for(let i = 0; i < errors.length; i += 1)console.error(errors[i]);
                throw errors[0];
            }
        } finally{
            this._debug(debugName, 'end');
        }
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */ async _saveSession(session) {
        this._debug('#_saveSession()', session);
        // _saveSession is always called whenever a new session has been acquired
        // so we can safely suppress the warning returned by future getSession calls
        this.suppressGetSessionWarning = true;
        await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, `${this.storageKey}-code-verifier`);
        // Create a shallow copy to work with, to avoid mutating the original session object if it's used elsewhere
        const sessionToProcess = Object.assign({}, session);
        const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
        if (this.userStorage) {
            if (!userIsProxy && sessionToProcess.user) // If it's a real user object, save it to userStorage.
            await (0, $96f7b0006107f2ac$export$e82c36d29078a87f)(this.userStorage, this.storageKey + '-user', {
                user: sessionToProcess.user
            });
            else userIsProxy;
            // Prepare the main session data for primary storage: remove the user property before cloning
            // This is important because the original session.user might be the proxy
            const mainSessionData = Object.assign({}, sessionToProcess);
            delete mainSessionData.user; // Remove user (real or proxy) before cloning for main storage
            const clonedMainSessionData = (0, $96f7b0006107f2ac$export$b7d58db314e0ac27)(mainSessionData);
            await (0, $96f7b0006107f2ac$export$e82c36d29078a87f)(this.storage, this.storageKey, clonedMainSessionData);
        } else {
            // No userStorage is configured.
            // In this case, session.user should ideally not be a proxy.
            // If it were, structuredClone would fail. This implies an issue elsewhere if user is a proxy here
            const clonedSession = (0, $96f7b0006107f2ac$export$b7d58db314e0ac27)(sessionToProcess); // sessionToProcess still has its original user property
            await (0, $96f7b0006107f2ac$export$e82c36d29078a87f)(this.storage, this.storageKey, clonedSession);
        }
    }
    async _removeSession() {
        this._debug('#_removeSession()');
        this.suppressGetSessionWarning = false;
        await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, this.storageKey);
        await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, this.storageKey + '-code-verifier');
        await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.storage, this.storageKey + '-user');
        if (this.userStorage) await (0, $96f7b0006107f2ac$export$d35c645d585317ec)(this.userStorage, this.storageKey + '-user');
        await this._notifyAllSubscribers('SIGNED_OUT', null);
    }
    /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */ _removeVisibilityChangedCallback() {
        this._debug('#_removeVisibilityChangedCallback()');
        const callback = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
            if (callback && (0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) window.removeEventListener('visibilitychange', callback);
        } catch (e) {
            console.error('removing visibilitychange callback failed', e);
        }
    }
    /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */ async _startAutoRefresh() {
        await this._stopAutoRefresh();
        this._debug('#_startAutoRefresh()');
        const ticker = setInterval(()=>this._autoRefreshTokenTick(), (0, $79e77f61ec218cd7$export$a4558fee79d6c8ae));
        this.autoRefreshTicker = ticker;
        if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') // ticker is a NodeJS Timeout object that has an `unref` method
        // https://nodejs.org/api/timers.html#timeoutunref
        // When auto refresh is used in NodeJS (like for testing) the
        // `setInterval` is preventing the process from being marked as
        // finished and tests run endlessly. This can be prevented by calling
        // `unref()` on the returned object.
        ticker.unref();
        else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') // similar like for NodeJS, but with the Deno API
        // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
        // @ts-expect-error TS has no context of Deno
        Deno.unrefTimer(ticker);
        // run the tick immediately, but in the next pass of the event loop so that
        // #_initialize can be allowed to complete without recursively waiting on
        // itself
        setTimeout(async ()=>{
            await this.initializePromise;
            await this._autoRefreshTokenTick();
        }, 0);
    }
    /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */ async _stopAutoRefresh() {
        this._debug('#_stopAutoRefresh()');
        const ticker = this.autoRefreshTicker;
        this.autoRefreshTicker = null;
        if (ticker) clearInterval(ticker);
    }
    /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */ async startAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._startAutoRefresh();
    }
    /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */ async stopAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._stopAutoRefresh();
    }
    /**
     * Runs the auto refresh token tick.
     */ async _autoRefreshTokenTick() {
        this._debug('#_autoRefreshTokenTick()', 'begin');
        try {
            await this._acquireLock(0, async ()=>{
                try {
                    const now = Date.now();
                    try {
                        return await this._useSession(async (result)=>{
                            const { data: { session: session } } = result;
                            if (!session || !session.refresh_token || !session.expires_at) {
                                this._debug('#_autoRefreshTokenTick()', 'no session');
                                return;
                            }
                            // session will expire in this many ticks (or has already expired if <= 0)
                            const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / (0, $79e77f61ec218cd7$export$a4558fee79d6c8ae));
                            this._debug('#_autoRefreshTokenTick()', `access token expires in ${expiresInTicks} ticks, a tick lasts ${(0, $79e77f61ec218cd7$export$a4558fee79d6c8ae)}ms, refresh threshold is ${(0, $79e77f61ec218cd7$export$f20a97df8f5fe223)} ticks`);
                            if (expiresInTicks <= (0, $79e77f61ec218cd7$export$f20a97df8f5fe223)) await this._callRefreshToken(session.refresh_token);
                        });
                    } catch (e) {
                        console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                    }
                } finally{
                    this._debug('#_autoRefreshTokenTick()', 'end');
                }
            });
        } catch (e) {
            if (e.isAcquireTimeout || e instanceof (0, $8d234999934c9269$export$23e9464cc010dff9)) this._debug('auto refresh token tick lock not available');
            else throw e;
        }
    }
    /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */ async _handleVisibilityChange() {
        this._debug('#_handleVisibilityChange()');
        if (!(0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
            if (this.autoRefreshToken) // in non-browser environments the refresh token ticker runs always
            this.startAutoRefresh();
            return false;
        }
        try {
            this.visibilityChangedCallback = async ()=>await this._onVisibilityChanged(false);
            window === null || window === void 0 || window.addEventListener('visibilitychange', this.visibilityChangedCallback);
            // now immediately call the visbility changed callback to setup with the
            // current visbility state
            await this._onVisibilityChanged(true); // initial call
        } catch (error) {
            console.error('_handleVisibilityChange', error);
        }
    }
    /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */ async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
        this._debug(methodName, 'visibilityState', document.visibilityState);
        if (document.visibilityState === 'visible') {
            if (this.autoRefreshToken) // in browser environments the refresh token ticker runs only on focused tabs
            // which prevents race conditions
            this._startAutoRefresh();
            if (!calledFromInitialize) {
                // called when the visibility has changed, i.e. the browser
                // transitioned from hidden -> visible so we need to see if the session
                // should be recovered immediately... but to do that we need to acquire
                // the lock first asynchronously
                await this.initializePromise;
                await this._acquireLock(-1, async ()=>{
                    if (document.visibilityState !== 'visible') {
                        this._debug(methodName, 'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting');
                        // visibility has changed while waiting for the lock, abort
                        return;
                    }
                    // recover the session
                    await this._recoverAndRefresh();
                });
            }
        } else if (document.visibilityState === 'hidden') {
            if (this.autoRefreshToken) this._stopAutoRefresh();
        }
    }
    /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */ async _getUrlForProvider(url, provider, options) {
        const urlParams = [
            `provider=${encodeURIComponent(provider)}`
        ];
        if (options === null || options === void 0 ? void 0 : options.redirectTo) urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
        if (options === null || options === void 0 ? void 0 : options.scopes) urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
        if (this.flowType === 'pkce') {
            const [codeChallenge, codeChallengeMethod] = await (0, $96f7b0006107f2ac$export$81b177cadfcf873c)(this.storage, this.storageKey);
            const flowParams = new URLSearchParams({
                code_challenge: `${encodeURIComponent(codeChallenge)}`,
                code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`
            });
            urlParams.push(flowParams.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
            const query = new URLSearchParams(options.queryParams);
            urlParams.push(query.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
        return `${url}?${urlParams.join('&')}`;
    }
    async _unenroll(params) {
        try {
            return await this._useSession(async (result)=>{
                var _a;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    async _enroll(params) {
        try {
            return await this._useSession(async (result)=>{
                var _a, _b;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                const body = Object.assign({
                    friendly_name: params.friendlyName,
                    factor_type: params.factorType
                }, params.factorType === 'phone' ? {
                    phone: params.phone
                } : params.factorType === 'totp' ? {
                    issuer: params.issuer
                } : {});
                const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/factors`, {
                    body: body,
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
                });
                if (error) return this._returnResult({
                    data: null,
                    error: error
                });
                if (params.factorType === 'totp' && data.type === 'totp' && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                return this._returnResult({
                    data: data,
                    error: null
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    async _verify(params) {
        return this._acquireLock(-1, async ()=>{
            try {
                return await this._useSession(async (result)=>{
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) return this._returnResult({
                        data: null,
                        error: sessionError
                    });
                    const body = Object.assign({
                        challenge_id: params.challengeId
                    }, 'webauthn' in params ? {
                        webauthn: Object.assign(Object.assign({}, params.webauthn), {
                            credential_response: params.webauthn.type === 'create' ? (0, $5258140a77314b98$export$4b534f6222f6d585)(params.webauthn.credential_response) : (0, $5258140a77314b98$export$b3350da6d3acaa5a)(params.webauthn.credential_response)
                        })
                    } : {
                        code: params.code
                    });
                    const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                        body: body,
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
                    });
                    if (error) return this._returnResult({
                        data: null,
                        error: error
                    });
                    await this._saveSession(Object.assign({
                        expires_at: Math.round(Date.now() / 1000) + data.expires_in
                    }, data));
                    await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                    return this._returnResult({
                        data: data,
                        error: error
                    });
                });
            } catch (error) {
                if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                    data: null,
                    error: error
                });
                throw error;
            }
        });
    }
    async _challenge(params) {
        return this._acquireLock(-1, async ()=>{
            try {
                return await this._useSession(async (result)=>{
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) return this._returnResult({
                        data: null,
                        error: sessionError
                    });
                    const response = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                        body: params,
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
                    });
                    if (response.error) return response;
                    const { data: data } = response;
                    if (data.type !== 'webauthn') return {
                        data: data,
                        error: null
                    };
                    switch(data.webauthn.type){
                        case 'create':
                            return {
                                data: Object.assign(Object.assign({}, data), {
                                    webauthn: Object.assign(Object.assign({}, data.webauthn), {
                                        credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), {
                                            publicKey: (0, $5258140a77314b98$export$d02e6c69c68605f0)(data.webauthn.credential_options.publicKey)
                                        })
                                    })
                                }),
                                error: null
                            };
                        case 'request':
                            return {
                                data: Object.assign(Object.assign({}, data), {
                                    webauthn: Object.assign(Object.assign({}, data.webauthn), {
                                        credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), {
                                            publicKey: (0, $5258140a77314b98$export$943ff00a541d1017)(data.webauthn.credential_options.publicKey)
                                        })
                                    })
                                }),
                                error: null
                            };
                    }
                });
            } catch (error) {
                if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                    data: null,
                    error: error
                });
                throw error;
            }
        });
    }
    /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */ async _challengeAndVerify(params) {
        // both _challenge and _verify independently acquire the lock, so no need
        // to acquire it here
        const { data: challengeData, error: challengeError } = await this._challenge({
            factorId: params.factorId
        });
        if (challengeError) return this._returnResult({
            data: null,
            error: challengeError
        });
        return await this._verify({
            factorId: params.factorId,
            challengeId: challengeData.id,
            code: params.code
        });
    }
    /**
     * {@see GoTrueMFAApi#listFactors}
     */ async _listFactors() {
        var _a;
        // use #getUser instead of #_getUser as the former acquires a lock
        const { data: { user: user }, error: userError } = await this.getUser();
        if (userError) return {
            data: null,
            error: userError
        };
        const data = {
            all: [],
            phone: [],
            totp: [],
            webauthn: []
        };
        // loop over the factors ONCE
        for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []){
            data.all.push(factor);
            if (factor.status === 'verified') data[factor.factor_type].push(factor);
        }
        return {
            data: data,
            error: null
        };
    }
    /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */ async _getAuthenticatorAssuranceLevel() {
        var _a, _b;
        const { data: { session: session }, error: sessionError } = await this.getSession();
        if (sessionError) return this._returnResult({
            data: null,
            error: sessionError
        });
        if (!session) return {
            data: {
                currentLevel: null,
                nextLevel: null,
                currentAuthenticationMethods: []
            },
            error: null
        };
        const { payload: payload } = (0, $96f7b0006107f2ac$export$9a62e6c0a30e00bc)(session.access_token);
        let currentLevel = null;
        if (payload.aal) currentLevel = payload.aal;
        let nextLevel = currentLevel;
        const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor)=>factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
        if (verifiedFactors.length > 0) nextLevel = 'aal2';
        const currentAuthenticationMethods = payload.amr || [];
        return {
            data: {
                currentLevel: currentLevel,
                nextLevel: nextLevel,
                currentAuthenticationMethods: currentAuthenticationMethods
            },
            error: null
        };
    }
    /**
     * Retrieves details about an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * Returns authorization details including client info, scopes, and user information.
     * If the API returns a redirect_uri, it means consent was already given - the caller
     * should handle the redirect manually if needed.
     */ async _getAuthorizationDetails(authorizationId) {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                if (!session) return this._returnResult({
                    data: null,
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                });
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/oauth/authorizations/${authorizationId}`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    xform: (data)=>({
                            data: data,
                            error: null
                        })
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Approves an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */ async _approveAuthorization(authorizationId, options) {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                if (!session) return this._returnResult({
                    data: null,
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                });
                const response = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    body: {
                        action: 'approve'
                    },
                    xform: (data)=>({
                            data: data,
                            error: null
                        })
                });
                if (response.data && response.data.redirect_url) // Automatically redirect in browser unless skipBrowserRedirect is true
                {
                    if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) window.location.assign(response.data.redirect_url);
                }
                return response;
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Denies an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */ async _denyAuthorization(authorizationId, options) {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                if (!session) return this._returnResult({
                    data: null,
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                });
                const response = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    body: {
                        action: 'deny'
                    },
                    xform: (data)=>({
                            data: data,
                            error: null
                        })
                });
                if (response.data && response.data.redirect_url) // Automatically redirect in browser unless skipBrowserRedirect is true
                {
                    if ((0, $96f7b0006107f2ac$export$4e09c449d6c407f7)() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) window.location.assign(response.data.redirect_url);
                }
                return response;
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Lists all OAuth grants that the authenticated user has authorized.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */ async _listOAuthGrants() {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                if (!session) return this._returnResult({
                    data: null,
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                });
                return await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/user/oauth/grants`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    xform: (data)=>({
                            data: data,
                            error: null
                        })
                });
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    /**
     * Revokes a user's OAuth grant for a specific client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */ async _revokeOAuthGrant(options) {
        try {
            return await this._useSession(async (result)=>{
                const { data: { session: session }, error: sessionError } = result;
                if (sessionError) return this._returnResult({
                    data: null,
                    error: sessionError
                });
                if (!session) return this._returnResult({
                    data: null,
                    error: new (0, $47f551231c4752e9$export$403b3fc0d3ad5f0c)()
                });
                await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'DELETE', `${this.url}/user/oauth/grants`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    query: {
                        client_id: options.clientId
                    },
                    noResolveJson: true
                });
                return {
                    data: {},
                    error: null
                };
            });
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
    async fetchJwk(kid, jwks = {
        keys: []
    }) {
        // try fetching from the supplied jwks
        let jwk = jwks.keys.find((key)=>key.kid === kid);
        if (jwk) return jwk;
        const now = Date.now();
        // try fetching from cache
        jwk = this.jwks.keys.find((key)=>key.kid === kid);
        // jwk exists and jwks isn't stale
        if (jwk && this.jwks_cached_at + (0, $79e77f61ec218cd7$export$5bd768495200f133) > now) return jwk;
        // jwk isn't cached in memory so we need to fetch it from the well-known endpoint
        const { data: data, error: error } = await (0, $041cf3bbe560a6d3$export$8969b3850ca2cdfd)(this.fetch, 'GET', `${this.url}/.well-known/jwks.json`, {
            headers: this.headers
        });
        if (error) throw error;
        if (!data.keys || data.keys.length === 0) return null;
        this.jwks = data;
        this.jwks_cached_at = now;
        // Find the signing key
        jwk = data.keys.find((key)=>key.kid === kid);
        if (!jwk) return null;
        return jwk;
    }
    /**
     * Extracts the JWT claims present in the access token by first verifying the
     * JWT against the server's JSON Web Key Set endpoint
     * `/.well-known/jwks.json` which is often cached, resulting in significantly
     * faster responses. Prefer this method over {@link #getUser} which always
     * sends a request to the Auth server for each JWT.
     *
     * If the project is not using an asymmetric JWT signing key (like ECC or
     * RSA) it always sends a request to the Auth server (similar to {@link
     * #getUser}) to verify the JWT.
     *
     * @param jwt An optional specific JWT you wish to verify, not the one you
     *            can obtain from {@link #getSession}.
     * @param options Various additional options that allow you to customize the
     *                behavior of this method.
     */ async getClaims(jwt, options = {}) {
        try {
            let token = jwt;
            if (!token) {
                const { data: data, error: error } = await this.getSession();
                if (error || !data.session) return this._returnResult({
                    data: null,
                    error: error
                });
                token = data.session.access_token;
            }
            const { header: header, payload: payload, signature: signature, raw: { header: rawHeader, payload: rawPayload } } = (0, $96f7b0006107f2ac$export$9a62e6c0a30e00bc)(token);
            if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) // Reject expired JWTs should only happen if jwt argument was passed
            (0, $96f7b0006107f2ac$export$a5850868adeb9253)(payload.exp);
            const signingKey = !header.alg || header.alg.startsWith('HS') || !header.kid || !('crypto' in globalThis && 'subtle' in globalThis.crypto) ? null : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? {
                keys: options.keys
            } : options === null || options === void 0 ? void 0 : options.jwks);
            // If symmetric algorithm or WebCrypto API is unavailable, fallback to getUser()
            if (!signingKey) {
                const { error: error } = await this.getUser(token);
                if (error) throw error;
                // getUser succeeds so the claims in the JWT can be trusted
                return {
                    data: {
                        claims: payload,
                        header: header,
                        signature: signature
                    },
                    error: null
                };
            }
            const algorithm = (0, $96f7b0006107f2ac$export$fa59f625ab60cb91)(header.alg);
            // Convert JWK to CryptoKey
            const publicKey = await crypto.subtle.importKey('jwk', signingKey, algorithm, true, [
                'verify'
            ]);
            // Verify the signature
            const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, (0, $5c1fd3f86e5f2223$export$a098e7b533f96db3)(`${rawHeader}.${rawPayload}`));
            if (!isValid) throw new (0, $47f551231c4752e9$export$d04cb18528f2043e)('Invalid JWT signature');
            // If verification succeeds, decode and return claims
            return {
                data: {
                    claims: payload,
                    header: header,
                    signature: signature
                },
                error: null
            };
        } catch (error) {
            if ((0, $47f551231c4752e9$export$cde1786a482f9a1c)(error)) return this._returnResult({
                data: null,
                error: error
            });
            throw error;
        }
    }
}
$9319d2e9f8204577$var$GoTrueClient.nextInstanceID = {};
var $9319d2e9f8204577$export$2e2bcd8739ae039 = $9319d2e9f8204577$var$GoTrueClient;



const $d6a4d2733ae17e57$var$AuthAdminApi = (0, $ff481397fb5f7271$export$2e2bcd8739ae039);
var $d6a4d2733ae17e57$export$2e2bcd8739ae039 = $d6a4d2733ae17e57$var$AuthAdminApi;



const $2e546876ef8182e8$var$AuthClient = (0, $9319d2e9f8204577$export$2e2bcd8739ae039);
var $2e546876ef8182e8$export$2e2bcd8739ae039 = $2e546876ef8182e8$var$AuthClient;







//#region src/lib/version.ts
const $1e9a43e765120696$var$version = "2.89.0";
//#endregion
//#region src/lib/constants.ts
let $1e9a43e765120696$var$JS_ENV = "";
if (typeof Deno !== "undefined") $1e9a43e765120696$var$JS_ENV = "deno";
else if (typeof document !== "undefined") $1e9a43e765120696$var$JS_ENV = "web";
else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") $1e9a43e765120696$var$JS_ENV = "react-native";
else $1e9a43e765120696$var$JS_ENV = "node";
const $1e9a43e765120696$var$DEFAULT_HEADERS = {
    "X-Client-Info": `supabase-js-${$1e9a43e765120696$var$JS_ENV}/${$1e9a43e765120696$var$version}`
};
const $1e9a43e765120696$var$DEFAULT_GLOBAL_OPTIONS = {
    headers: $1e9a43e765120696$var$DEFAULT_HEADERS
};
const $1e9a43e765120696$var$DEFAULT_DB_OPTIONS = {
    schema: "public"
};
const $1e9a43e765120696$var$DEFAULT_AUTH_OPTIONS = {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit"
};
const $1e9a43e765120696$var$DEFAULT_REALTIME_OPTIONS = {};
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function $1e9a43e765120696$var$_typeof(o) {
    "@babel/helpers - typeof";
    return $1e9a43e765120696$var$_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
        return typeof o$1;
    } : function(o$1) {
        return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
    }, $1e9a43e765120696$var$_typeof(o);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function $1e9a43e765120696$var$toPrimitive(t, r) {
    if ("object" != $1e9a43e765120696$var$_typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != $1e9a43e765120696$var$_typeof(i)) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function $1e9a43e765120696$var$toPropertyKey(t) {
    var i = $1e9a43e765120696$var$toPrimitive(t, "string");
    return "symbol" == $1e9a43e765120696$var$_typeof(i) ? i : i + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function $1e9a43e765120696$var$_defineProperty(e, r, t) {
    return (r = $1e9a43e765120696$var$toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function $1e9a43e765120696$var$ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r$1) {
            return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function $1e9a43e765120696$var$_objectSpread2(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? $1e9a43e765120696$var$ownKeys(Object(t), !0).forEach(function(r$1) {
            $1e9a43e765120696$var$_defineProperty(e, r$1, t[r$1]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : $1e9a43e765120696$var$ownKeys(Object(t)).forEach(function(r$1) {
            Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
        });
    }
    return e;
}
//#endregion
//#region src/lib/fetch.ts
const $1e9a43e765120696$var$resolveFetch = (customFetch)=>{
    if (customFetch) return (...args)=>customFetch(...args);
    return (...args)=>fetch(...args);
};
const $1e9a43e765120696$var$resolveHeadersConstructor = ()=>{
    return Headers;
};
const $1e9a43e765120696$var$fetchWithAuth = (supabaseKey, getAccessToken, customFetch)=>{
    const fetch$1 = $1e9a43e765120696$var$resolveFetch(customFetch);
    const HeadersConstructor = $1e9a43e765120696$var$resolveHeadersConstructor();
    return async (input, init)=>{
        var _await$getAccessToken;
        const accessToken = (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0 ? _await$getAccessToken : supabaseKey;
        let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
        if (!headers.has("apikey")) headers.set("apikey", supabaseKey);
        if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
        return fetch$1(input, $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, init), {}, {
            headers: headers
        }));
    };
};
//#endregion
//#region src/lib/helpers.ts
function $1e9a43e765120696$var$ensureTrailingSlash(url) {
    return url.endsWith("/") ? url : url + "/";
}
function $1e9a43e765120696$var$applySettingDefaults(options, defaults) {
    var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header;
    const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
    const { db: DEFAULT_DB_OPTIONS$1, auth: DEFAULT_AUTH_OPTIONS$1, realtime: DEFAULT_REALTIME_OPTIONS$1, global: DEFAULT_GLOBAL_OPTIONS$1 } = defaults;
    const result = {
        db: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, DEFAULT_DB_OPTIONS$1), dbOptions),
        auth: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
        realtime: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
        storage: {},
        global: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions), {}, {
            headers: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, (_DEFAULT_GLOBAL_OPTIO = DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0 ? _DEFAULT_GLOBAL_OPTIO : {}), (_globalOptions$header = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _globalOptions$header !== void 0 ? _globalOptions$header : {})
        }),
        accessToken: async ()=>""
    };
    if (options.accessToken) result.accessToken = options.accessToken;
    else delete result.accessToken;
    return result;
}
/**
* Validates a Supabase client URL
*
* @param {string} supabaseUrl - The Supabase client URL string.
* @returns {URL} - The validated base URL.
* @throws {Error}
*/ function $1e9a43e765120696$var$validateSupabaseUrl(supabaseUrl) {
    const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
    if (!trimmedUrl) throw new Error("supabaseUrl is required.");
    if (!trimmedUrl.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
    try {
        return new URL($1e9a43e765120696$var$ensureTrailingSlash(trimmedUrl));
    } catch (_unused) {
        throw Error("Invalid supabaseUrl: Provided URL is malformed.");
    }
}
//#endregion
//#region src/lib/SupabaseAuthClient.ts
var $1e9a43e765120696$var$SupabaseAuthClient = class extends (0, $2e546876ef8182e8$export$2e2bcd8739ae039) {
    constructor(options){
        super(options);
    }
};
//#endregion
//#region src/SupabaseClient.ts
/**
* Supabase Client.
*
* An isomorphic Javascript client for interacting with Postgres.
*/ var $1e9a43e765120696$export$1bfe63e045eb2ffa = class {
    /**
	* Create a new client for use in the browser.
	* @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
	* @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
	* @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
	* @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
	* @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
	* @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
	* @param options.realtime Options passed along to realtime-js constructor.
	* @param options.storage Options passed along to the storage-js constructor.
	* @param options.global.fetch A custom fetch implementation.
	* @param options.global.headers Any additional headers to send with each network request.
	* @example
	* ```ts
	* import { createClient } from '@supabase/supabase-js'
	*
	* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
	* const { data } = await supabase.from('profiles').select('*')
	* ```
	*/ constructor(supabaseUrl, supabaseKey, options){
        var _settings$auth$storag, _settings$global$head;
        this.supabaseUrl = supabaseUrl;
        this.supabaseKey = supabaseKey;
        const baseUrl = $1e9a43e765120696$var$validateSupabaseUrl(supabaseUrl);
        if (!supabaseKey) throw new Error("supabaseKey is required.");
        this.realtimeUrl = new URL("realtime/v1", baseUrl);
        this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
        this.authUrl = new URL("auth/v1", baseUrl);
        this.storageUrl = new URL("storage/v1", baseUrl);
        this.functionsUrl = new URL("functions/v1", baseUrl);
        const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
        const DEFAULTS = {
            db: $1e9a43e765120696$var$DEFAULT_DB_OPTIONS,
            realtime: $1e9a43e765120696$var$DEFAULT_REALTIME_OPTIONS,
            auth: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, $1e9a43e765120696$var$DEFAULT_AUTH_OPTIONS), {}, {
                storageKey: defaultStorageKey
            }),
            global: $1e9a43e765120696$var$DEFAULT_GLOBAL_OPTIONS
        };
        const settings = $1e9a43e765120696$var$applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
        this.storageKey = (_settings$auth$storag = settings.auth.storageKey) !== null && _settings$auth$storag !== void 0 ? _settings$auth$storag : "";
        this.headers = (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0 ? _settings$global$head : {};
        if (!settings.accessToken) {
            var _settings$auth;
            this.auth = this._initSupabaseAuthClient((_settings$auth = settings.auth) !== null && _settings$auth !== void 0 ? _settings$auth : {}, this.headers, settings.global.fetch);
        } else {
            this.accessToken = settings.accessToken;
            this.auth = new Proxy({}, {
                get: (_, prop)=>{
                    throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
                }
            });
        }
        this.fetch = $1e9a43e765120696$var$fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
        this.realtime = this._initRealtimeClient($1e9a43e765120696$var$_objectSpread2({
            headers: this.headers,
            accessToken: this._getAccessToken.bind(this)
        }, settings.realtime));
        if (this.accessToken) this.accessToken().then((token)=>this.realtime.setAuth(token)).catch((e)=>console.warn("Failed to set initial Realtime auth token:", e));
        this.rest = new (0, $8528e49f2233f2c9$export$796f32e2ee984aaa)(new URL("rest/v1", baseUrl).href, {
            headers: this.headers,
            schema: settings.db.schema,
            fetch: this.fetch
        });
        this.storage = new (0, $bdff222bb38616b2$export$6c85f5032e75eff9)(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
        if (!settings.accessToken) this._listenForAuthEvents();
    }
    /**
	* Supabase Functions allows you to deploy and invoke edge functions.
	*/ get functions() {
        return new (0, $8e338ae52f5b464a$export$1d0b400bf8a0fa55)(this.functionsUrl.href, {
            headers: this.headers,
            customFetch: this.fetch
        });
    }
    /**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/ from(relation) {
        return this.rest.from(relation);
    }
    /**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/ schema(schema) {
        return this.rest.schema(schema);
    }
    /**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/ rpc(fn, args = {}, options = {
        head: false,
        get: false,
        count: void 0
    }) {
        return this.rest.rpc(fn, args, options);
    }
    /**
	* Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
	*
	* @param {string} name - The name of the Realtime channel.
	* @param {Object} opts - The options to pass to the Realtime channel.
	*
	*/ channel(name, opts = {
        config: {}
    }) {
        return this.realtime.channel(name, opts);
    }
    /**
	* Returns all Realtime channels.
	*/ getChannels() {
        return this.realtime.getChannels();
    }
    /**
	* Unsubscribes and removes Realtime channel from Realtime client.
	*
	* @param {RealtimeChannel} channel - The name of the Realtime channel.
	*
	*/ removeChannel(channel) {
        return this.realtime.removeChannel(channel);
    }
    /**
	* Unsubscribes and removes all Realtime channels from Realtime client.
	*/ removeAllChannels() {
        return this.realtime.removeAllChannels();
    }
    async _getAccessToken() {
        var _this = this;
        var _data$session$access_, _data$session;
        if (_this.accessToken) return await _this.accessToken();
        const { data: data } = await _this.auth.getSession();
        return (_data$session$access_ = (_data$session = data.session) === null || _data$session === void 0 ? void 0 : _data$session.access_token) !== null && _data$session$access_ !== void 0 ? _data$session$access_ : _this.supabaseKey;
    }
    _initSupabaseAuthClient({ autoRefreshToken: autoRefreshToken, persistSession: persistSession, detectSessionInUrl: detectSessionInUrl, storage: storage, userStorage: userStorage, storageKey: storageKey, flowType: flowType, lock: lock, debug: debug, throwOnError: throwOnError }, headers, fetch$1) {
        const authHeaders = {
            Authorization: `Bearer ${this.supabaseKey}`,
            apikey: `${this.supabaseKey}`
        };
        return new $1e9a43e765120696$var$SupabaseAuthClient({
            url: this.authUrl.href,
            headers: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, authHeaders), headers),
            storageKey: storageKey,
            autoRefreshToken: autoRefreshToken,
            persistSession: persistSession,
            detectSessionInUrl: detectSessionInUrl,
            storage: storage,
            userStorage: userStorage,
            flowType: flowType,
            lock: lock,
            debug: debug,
            throwOnError: throwOnError,
            fetch: fetch$1,
            hasCustomAuthorizationHeader: Object.keys(this.headers).some((key)=>key.toLowerCase() === "authorization")
        });
    }
    _initRealtimeClient(options) {
        return new (0, $386baf7f763905e6$export$2e2bcd8739ae039)(this.realtimeUrl.href, $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, options), {}, {
            params: $1e9a43e765120696$var$_objectSpread2($1e9a43e765120696$var$_objectSpread2({}, {
                apikey: this.supabaseKey
            }), options === null || options === void 0 ? void 0 : options.params)
        }));
    }
    _listenForAuthEvents() {
        return this.auth.onAuthStateChange((event, session)=>{
            this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
        });
    }
    _handleTokenChanged(event, source, token) {
        if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
            this.changedAccessToken = token;
            this.realtime.setAuth(token);
        } else if (event === "SIGNED_OUT") {
            this.realtime.setAuth();
            if (source == "STORAGE") this.auth.signOut();
            this.changedAccessToken = void 0;
        }
    }
};
//#endregion
//#region src/index.ts
/**
* Creates a new Supabase Client.
*
* @example
* ```ts
* import { createClient } from '@supabase/supabase-js'
*
* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
* const { data, error } = await supabase.from('profiles').select('*')
* ```
*/ const $1e9a43e765120696$export$5d730b7aed1a3eb0 = (supabaseUrl, supabaseKey, options)=>{
    return new $1e9a43e765120696$export$1bfe63e045eb2ffa(supabaseUrl, supabaseKey, options);
};
function $1e9a43e765120696$var$shouldShowDeprecationWarning() {
    if (typeof window !== "undefined") return false;
    return false;
}
if ($1e9a43e765120696$var$shouldShowDeprecationWarning()) console.warn("\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");


const $e3ccab11bd39500d$export$721045acb0bbe132 = "https://uhkfmppomxibrwhtaxsg.supabase.co";
const $e3ccab11bd39500d$export$b77c07a50a90ca85 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2ZtcHBvbXhpYnJ3aHRheHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA5ODEsImV4cCI6MjA4MTY4Njk4MX0.oy4e5s-jVOUXp0b2qM9FpMClrQ3jUsbYIfGNYVuhc6Q";
const $e3ccab11bd39500d$export$ce88b0839a93273 = "https://securelifehub.netlify.app";


const $e3ba92ab3b2980d6$var$supabase = (0, $1e9a43e765120696$export$5d730b7aed1a3eb0)((0, $e3ccab11bd39500d$export$721045acb0bbe132), (0, $e3ccab11bd39500d$export$b77c07a50a90ca85));
// -- State --
let $e3ba92ab3b2980d6$var$user = null;
let $e3ba92ab3b2980d6$var$allItems = [] // The full vault
;
let $e3ba92ab3b2980d6$var$filteredItems = [] // Currently shown in list
;
let $e3ba92ab3b2980d6$var$folders = [] // The folders
;
let $e3ba92ab3b2980d6$var$recentItemsIds = [] // IDs of recently used items
;
let $e3ba92ab3b2980d6$var$currentView = 'vault' // 'vault' or 'sections'
;
let $e3ba92ab3b2980d6$var$currentMode = 'all' // 'all' or 'recents'
;
let $e3ba92ab3b2980d6$var$preferenceItem = null // System pref item
;
let $e3ba92ab3b2980d6$var$selectedItem = null // Currently viewed item
;
let $e3ba92ab3b2980d6$var$currentCustomFields = [] // Custom fields in edit form
;
// -- Elements --
const $e3ba92ab3b2980d6$var$authSection = document.getElementById('auth-section');
const $e3ba92ab3b2980d6$var$vaultSection = document.getElementById('vault-section');
// List & Sidebar
const $e3ba92ab3b2980d6$var$itemsList = document.getElementById('items-list');
const $e3ba92ab3b2980d6$var$searchInput = document.getElementById('search');
const $e3ba92ab3b2980d6$var$addBtn = document.getElementById('add-btn');
const $e3ba92ab3b2980d6$var$menuBtn = document.getElementById('menu-btn');
const $e3ba92ab3b2980d6$var$vaultView = document.getElementById('vault-view');
const $e3ba92ab3b2980d6$var$sectionsView = document.getElementById('sections-view');
const $e3ba92ab3b2980d6$var$tabVault = document.getElementById('tab-vault');
const $e3ba92ab3b2980d6$var$tabCards = document.getElementById('tab-cards');
const $e3ba92ab3b2980d6$var$tabSections = document.getElementById('tab-sections');
// Main Panel (Views)
const $e3ba92ab3b2980d6$var$emptyState = document.getElementById('empty-state');
const $e3ba92ab3b2980d6$var$detailView = document.getElementById('detail-view');
const $e3ba92ab3b2980d6$var$editForm = document.getElementById('edit-form');
// Details View Elements
const $e3ba92ab3b2980d6$var$viewIcon = document.getElementById('view-icon');
const $e3ba92ab3b2980d6$var$viewTitle = document.getElementById('view-title');
const $e3ba92ab3b2980d6$var$viewFavBtn = document.getElementById('view-fav-btn');
const $e3ba92ab3b2980d6$var$viewUsername = document.getElementById('view-username');
const $e3ba92ab3b2980d6$var$viewPassword = document.getElementById('view-password');
const $e3ba92ab3b2980d6$var$viewWebsite = document.getElementById('view-website');
const $e3ba92ab3b2980d6$var$viewNotes = document.getElementById('view-notes');
const $e3ba92ab3b2980d6$var$togglePassBtn = document.getElementById('toggle-pass-btn');
const $e3ba92ab3b2980d6$var$launchBtn = document.getElementById('launch-btn');
const $e3ba92ab3b2980d6$var$editBtn = document.getElementById('edit-btn');
// Edit Form Elements
const $e3ba92ab3b2980d6$var$editId = document.getElementById('edit-id');
const $e3ba92ab3b2980d6$var$editTitle = document.getElementById('edit-title');
const $e3ba92ab3b2980d6$var$editUsername = document.getElementById('edit-username');
const $e3ba92ab3b2980d6$var$editPassword = document.getElementById('edit-password');
const $e3ba92ab3b2980d6$var$editWebsite = document.getElementById('edit-website');
const $e3ba92ab3b2980d6$var$editCategory = document.getElementById('edit-category');
const $e3ba92ab3b2980d6$var$editFolder = document.getElementById('edit-folder');
const $e3ba92ab3b2980d6$var$editPictureInput = document.getElementById('edit-picture-input');
const $e3ba92ab3b2980d6$var$editPicturePreview = document.getElementById('edit-picture-preview');
const $e3ba92ab3b2980d6$var$editCustomFieldsList = document.getElementById('edit-custom-fields-list');
const $e3ba92ab3b2980d6$var$addCustomFieldBtn = document.getElementById('add-custom-field-btn');
const $e3ba92ab3b2980d6$var$editNotes = document.getElementById('edit-notes');
const $e3ba92ab3b2980d6$var$genPassBtn = document.getElementById('gen-pass-btn');
const $e3ba92ab3b2980d6$var$cancelEditBtn = document.getElementById('cancel-edit-btn');
const $e3ba92ab3b2980d6$var$saveBtn = document.getElementById('save-btn');
const $e3ba92ab3b2980d6$var$deleteBtn = document.getElementById('delete-btn');
// Menus
const $e3ba92ab3b2980d6$var$menuDropdown = document.getElementById('menu-dropdown');
const $e3ba92ab3b2980d6$var$menuOverlay = document.getElementById('menu-overlay');
const $e3ba92ab3b2980d6$var$menuUserEmail = document.getElementById('menu-user-email');
// -- Initialization --
console.log("SecureLifeHub Popup v2 Loaded");
async function $e3ba92ab3b2980d6$var$init() {
    // 1. Check synced session state from chrome storage
    const { sync_session: sync_session } = await chrome.storage.local.get([
        'sync_session'
    ]);
    // 2. Check extension's own Supabase state
    const { data: { session: localSession } } = await $e3ba92ab3b2980d6$var$supabase.auth.getSession();
    if (!sync_session) {
        // Web app is logged out. Extension must follow.
        console.log("SecureLifeHub: No synced session found. Ensuring extension is logged out.");
        if (localSession) await $e3ba92ab3b2980d6$var$supabase.auth.signOut();
        $e3ba92ab3b2980d6$var$user = null;
        $e3ba92ab3b2980d6$var$showLogin();
        return;
    }
    // 3. Web app is logged in. Apply sync_session if missing or mismatched.
    if (!localSession || localSession.access_token !== sync_session.access_token) {
        console.log("SecureLifeHub: Mismatch/Missing local session. Applying synced session...");
        try {
            const { data: data, error: error } = await $e3ba92ab3b2980d6$var$supabase.auth.setSession({
                access_token: sync_session.access_token,
                refresh_token: sync_session.refresh_token
            });
            if (!error && data.session) $e3ba92ab3b2980d6$var$user = data.session.user;
        } catch (e) {
            console.error("Failed to apply synced session:", e);
        }
    } else $e3ba92ab3b2980d6$var$user = localSession.user;
    // Load Preferences & State from local storage
    const storage = await chrome.storage.local.get([
        'recentItemsIds',
        'lastActiveTab',
        'lastSelectedItemId'
    ]);
    $e3ba92ab3b2980d6$var$recentItemsIds = storage.recentItemsIds || [];
    // Restore Last View
    if (storage.lastActiveTab) $e3ba92ab3b2980d6$var$currentView = storage.lastActiveTab;
    if ($e3ba92ab3b2980d6$var$user) $e3ba92ab3b2980d6$var$showVault() // This triggers fetchItems()
    ;
    else $e3ba92ab3b2980d6$var$showLogin();
    // Listen for storage changes while popup is open to handle real-time logout/login
    chrome.storage.onChanged.addListener((changes, namespace)=>{
        if (namespace === 'local' && changes.sync_session) {
            console.log("SecureLifeHub: Real-time session change detected via sync.");
            $e3ba92ab3b2980d6$var$init(); // Re-initialize state
        }
    });
}
function $e3ba92ab3b2980d6$var$showLogin() {
    $e3ba92ab3b2980d6$var$authSection.classList.remove('hidden');
    $e3ba92ab3b2980d6$var$vaultSection.classList.add('hidden');
}
function $e3ba92ab3b2980d6$var$showVault() {
    $e3ba92ab3b2980d6$var$authSection.classList.add('hidden');
    $e3ba92ab3b2980d6$var$vaultSection.classList.remove('hidden');
    if ($e3ba92ab3b2980d6$var$menuUserEmail) $e3ba92ab3b2980d6$var$menuUserEmail.textContent = $e3ba92ab3b2980d6$var$user.email;
    // Notify background script of login to sync back to any open web app tabs
    $e3ba92ab3b2980d6$var$supabase.auth.getSession().then(({ data: { session: session } })=>{
        if (session) chrome.runtime.sendMessage({
            type: 'SYNC_TO_WEB_APP',
            session: session
        });
    });
    $e3ba92ab3b2980d6$var$fetchItems();
}
// -- Data Access --
async function $e3ba92ab3b2980d6$var$fetchItems() {
    // Fetch Items
    const { data: itemData, error: itemError } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').select('*').order('created_at', {
        ascending: false
    });
    // Fetch Folders
    const { data: folderData, error: folderError } = await $e3ba92ab3b2980d6$var$supabase.from('folders').select('*').order('name');
    if (itemData) {
        $e3ba92ab3b2980d6$var$allItems = itemData;
        console.log("Fetched items:", $e3ba92ab3b2980d6$var$allItems.length);
        $e3ba92ab3b2980d6$var$preferenceItem = $e3ba92ab3b2980d6$var$allItems.find((i)=>i.title === "[SYSTEM] User Preferences");
        $e3ba92ab3b2980d6$var$cacheData($e3ba92ab3b2980d6$var$allItems);
        // Initial Filter
        $e3ba92ab3b2980d6$var$switchSidebarTab($e3ba92ab3b2980d6$var$currentView) // Ensure tab styles are correct
        ;
        // Check for current tab match to auto-select or highlight
        $e3ba92ab3b2980d6$var$checkForMatches();
        // Restore Selected Item if it exists in the newly fetched list
        const { lastSelectedItemId: lastSelectedItemId } = await chrome.storage.local.get([
            'lastSelectedItemId'
        ]);
        if (lastSelectedItemId) {
            const lastItem = $e3ba92ab3b2980d6$var$allItems.find((i)=>i.id === lastSelectedItemId);
            if (lastItem) $e3ba92ab3b2980d6$var$selectItem(lastItem, false) // false = don't re-save to trigger loop
            ;
        }
    }
    if (itemError) {
        console.error("Error fetching items:", itemError);
        alert("Sync failed: " + itemError.message);
    }
    if (folderData) {
        $e3ba92ab3b2980d6$var$folders = folderData;
        $e3ba92ab3b2980d6$var$populateFolderDropdown();
    }
}
function $e3ba92ab3b2980d6$var$populateFolderDropdown() {
    if (!$e3ba92ab3b2980d6$var$editFolder) return;
    $e3ba92ab3b2980d6$var$editFolder.innerHTML = '<option value="">None</option>';
    $e3ba92ab3b2980d6$var$folders.forEach((f)=>{
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = f.name;
        $e3ba92ab3b2980d6$var$editFolder.appendChild(opt);
    });
}
function $e3ba92ab3b2980d6$var$cacheData(items) {
    const isAutoFillEnabled = $e3ba92ab3b2980d6$var$preferenceItem?.item_metadata?.auto_fill_enabled === true;
    chrome.storage.local.set({
        vaultItems: items,
        autoFillEnabled: isAutoFillEnabled
    });
    $e3ba92ab3b2980d6$var$updateAutoFillBadge(isAutoFillEnabled);
}
function $e3ba92ab3b2980d6$var$updateAutoFillBadge(enabled) {
    const badge = document.getElementById('autofill-status');
    if (badge) {
        if (enabled) {
            badge.textContent = "ON";
            badge.className = "text-xs font-bold px-2 py-0.5 rounded bg-green-500 text-white";
        } else {
            badge.textContent = "OFF";
            badge.className = "text-xs font-bold px-2 py-0.5 rounded bg-gray-600 text-gray-300";
        }
    }
}
// -- Sidebar Rendering --
function $e3ba92ab3b2980d6$var$filterItems(query = "") {
    $e3ba92ab3b2980d6$var$itemsList.innerHTML = "";
    query = query.toLowerCase().trim();
    if ($e3ba92ab3b2980d6$var$currentView === 'cards') {
        const header = document.createElement('div');
        header.className = "px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3e3e42]";
        header.innerHTML = `
            <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Financial Cards</span>
        `;
        $e3ba92ab3b2980d6$var$itemsList.appendChild(header);
    }
    // 1. Get filtered items
    const passwordItems = $e3ba92ab3b2980d6$var$allItems.filter((item)=>{
        // Strict Tab Filtering
        if ($e3ba92ab3b2980d6$var$currentView === 'cards' && item.type !== 'financial-card') return false;
        if ($e3ba92ab3b2980d6$var$currentView === 'vault' && (item.type !== 'password' || item.category === 'Secure Notes')) return false;
        // General type filtering
        const isAllowedType = item.type === 'password' || item.type === 'financial-card';
        if (!isAllowedType) return false;
        // Exclusion filtering (Shared across views)
        if (item.category === 'Medications' || item.category === 'Health Records') return false;
        if (item.title?.startsWith("[SYSTEM]")) return false;
        // Query filtering
        if (query === "") return true;
        return item.title?.toLowerCase().includes(query) || item.username?.toLowerCase().includes(query) || item.website?.toLowerCase().includes(query) || item.item_metadata?.cardNumber && item.item_metadata.cardNumber.includes(query);
    });
    // Sort cards: Favorites first, then Debit cards
    if ($e3ba92ab3b2980d6$var$currentView === 'cards') passwordItems.sort((a, b)=>{
        // 1. Favorites first
        const aFav = a.is_favorite || a.favorite || a.item_metadata?.is_favorite || a.item_metadata?.favorite;
        const bFav = b.is_favorite || b.favorite || b.item_metadata?.is_favorite || b.item_metadata?.favorite;
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        // 2. Debit first within same favorite status
        const aIsDebit = a.item_metadata?.cardType?.toLowerCase().includes('debit') || a.category?.toLowerCase().includes('debit') || a.title?.toLowerCase().includes('debit');
        const bIsDebit = b.item_metadata?.cardType?.toLowerCase().includes('debit') || b.category?.toLowerCase().includes('debit') || b.title?.toLowerCase().includes('debit');
        if (aIsDebit && !bIsDebit) return -1;
        if (!aIsDebit && bIsDebit) return 1;
        return (a.title || "").localeCompare(b.title || "");
    });
    // 2. If no query and in vault mode, show Recents at the top
    if (query === "" && $e3ba92ab3b2980d6$var$currentView === 'vault' && $e3ba92ab3b2980d6$var$recentItemsIds.length > 0) {
        const recents = $e3ba92ab3b2980d6$var$recentItemsIds.map((id)=>$e3ba92ab3b2980d6$var$allItems.find((i)=>i.id === id)).filter((item)=>item && item.type === 'password' && item.category !== 'Medications' && item.category !== 'Health Records').slice(0, 5) // Show top 5 recents
        ;
        if (recents.length > 0) {
            const header = document.createElement('div');
            header.className = "px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-[#252526] border-b border-[#3e3e42]";
            header.textContent = "Quick Access (Recents)";
            $e3ba92ab3b2980d6$var$itemsList.appendChild(header);
            recents.forEach((item)=>{
                const el = $e3ba92ab3b2980d6$var$createListItem(item, true);
                $e3ba92ab3b2980d6$var$itemsList.appendChild(el);
            });
            const spacer = document.createElement('div');
            spacer.className = "h-4";
            $e3ba92ab3b2980d6$var$itemsList.appendChild(spacer);
            const allHeader = document.createElement('div');
            allHeader.className = "px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-[#252526] border-b border-[#3e3e42]";
            allHeader.textContent = "Vault Items";
            $e3ba92ab3b2980d6$var$itemsList.appendChild(allHeader);
        }
    }
    // 3. Render the list
    if (passwordItems.length === 0) {
        if (query !== "") $e3ba92ab3b2980d6$var$itemsList.innerHTML += `<div class="text-center text-gray-500 py-8 text-xs">No passwords found for "${query}"</div>`;
        else $e3ba92ab3b2980d6$var$itemsList.innerHTML += `<div class="text-center text-gray-500 py-8 text-xs">No passwords in vault</div>`;
        return;
    }
    passwordItems.forEach((item)=>{
        const el = $e3ba92ab3b2980d6$var$createListItem(item);
        $e3ba92ab3b2980d6$var$itemsList.appendChild(el);
    });
}
function $e3ba92ab3b2980d6$var$renderSections() {
    $e3ba92ab3b2980d6$var$sectionsView.innerHTML = "";
    // High-level sections
    const sections = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "\uD83C\uDFE0",
            page: "dashboard",
            color: "text-blue-400"
        },
        {
            id: "favorites",
            label: "Favorites",
            icon: "\u2B50",
            page: "favorites",
            color: "text-yellow-400"
        },
        {
            id: "payment-cards",
            label: "Financial Cards",
            icon: "\uD83D\uDCB3",
            page: "financial-cards",
            color: "text-emerald-400"
        },
        {
            id: "secure-database",
            label: "Secure Database",
            icon: "\uD83D\uDDC4\uFE0F",
            page: "secure-database",
            color: "text-purple-400"
        },
        {
            id: "personal-info",
            label: "Personal Info",
            icon: "\uD83D\uDC64",
            page: "personal-info",
            color: "text-indigo-400"
        },
        {
            id: "private-notes",
            label: "Private Notes",
            icon: "\uD83D\uDCDD",
            page: "type-secure-notes",
            color: "text-amber-400"
        },
        {
            id: "healthHub",
            label: "Health Hub",
            icon: "\uD83C\uDFE5",
            page: "type-health-records",
            color: "text-red-400"
        },
        {
            id: "vehicles",
            label: "Vehicles",
            icon: "\uD83D\uDE97",
            page: "type-vehicles",
            color: "text-orange-400"
        },
        {
            id: "business",
            label: "Business",
            icon: "\uD83D\uDCBC",
            page: "type-business",
            color: "text-blue-500"
        },
        {
            id: "digitalLife",
            label: "Digital Life",
            icon: "\uD83C\uDF10",
            page: "type-digital-life",
            color: "text-cyan-400"
        },
        {
            id: "settings",
            label: "Settings",
            icon: "\u2699\uFE0F",
            page: "settings",
            color: "text-gray-400"
        }
    ];
    const header = document.createElement('div');
    header.className = "px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider";
    header.textContent = "Application Sections";
    $e3ba92ab3b2980d6$var$sectionsView.appendChild(header);
    sections.forEach((sec)=>{
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2.5 hover:bg-[#333] rounded cursor-pointer transition-colors group";
        div.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                ${sec.icon}
            </div>
            <div class="flex-1">
                <div class="text-sm font-medium text-gray-200">${sec.label}</div>
            </div>
            <div class="p-1.5 hover:bg-[#444] rounded-md transition-all group-hover:text-white section-arrow-btn" title="Open in Extension">
                <svg class="w-4 h-4 text-gray-500 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        `;
        // Right Arrow Click: Extension internal "open/expand" behavior
        const arrowBtn = div.querySelector('.section-arrow-btn');
        arrowBtn.addEventListener('click', (e)=>{
            e.stopPropagation();
            if (sec.id === 'payment-cards') {
                $e3ba92ab3b2980d6$var$switchSidebarTab('cards');
                $e3ba92ab3b2980d6$var$searchInput.value = "";
                $e3ba92ab3b2980d6$var$searchInput.placeholder = "Search Cards...";
            } else if (sec.id === 'dashboard' || sec.id === 'favorites') {
                $e3ba92ab3b2980d6$var$switchSidebarTab('vault');
                $e3ba92ab3b2980d6$var$searchInput.value = "";
                $e3ba92ab3b2980d6$var$searchInput.placeholder = "Search Vault...";
            } else // If no specific extension view, default to web vault for "open" request
            $e3ba92ab3b2980d6$var$openInWebVault(sec.page);
        });
        // Main Div/Text Click: Directed directly to the main menu item (Web Vault)
        div.addEventListener('click', ()=>{
            $e3ba92ab3b2980d6$var$openInWebVault(sec.page);
        });
        $e3ba92ab3b2980d6$var$sectionsView.appendChild(div);
    });
}
async function $e3ba92ab3b2980d6$var$openInWebVault(page = "dashboard") {
    console.log("Opening web vault to page:", page);
    try {
        const { data: { session: session } } = await $e3ba92ab3b2980d6$var$supabase.auth.getSession();
        let url = `${(0, $e3ccab11bd39500d$export$ce88b0839a93273)}`;
        const params = new URLSearchParams();
        if (page !== "dashboard") params.append("page", page);
        if (session?.access_token && session?.refresh_token) {
            params.append("access_token", session.access_token);
            params.append("refresh_token", session.refresh_token);
        }
        const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
        console.log("Final URL:", finalUrl);
        chrome.tabs.create({
            url: finalUrl
        });
        $e3ba92ab3b2980d6$var$closeMenu();
    } catch (err) {
        console.error("Failed to open web vault:", err);
        // Fallback: just open the URL
        chrome.tabs.create({
            url: (0, $e3ccab11bd39500d$export$ce88b0839a93273)
        });
    }
}
function $e3ba92ab3b2980d6$var$switchSidebarTab(tab) {
    $e3ba92ab3b2980d6$var$currentView = tab;
    chrome.storage.local.set({
        lastActiveTab: tab
    });
    // Reset styles
    $e3ba92ab3b2980d6$var$tabVault.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors";
    $e3ba92ab3b2980d6$var$tabCards.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors";
    $e3ba92ab3b2980d6$var$tabSections.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors";
    $e3ba92ab3b2980d6$var$vaultView.classList.add('hidden');
    $e3ba92ab3b2980d6$var$sectionsView.classList.add('hidden');
    if (tab === 'vault') {
        $e3ba92ab3b2980d6$var$tabVault.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 border-b-2 border-blue-500 transition-colors";
        $e3ba92ab3b2980d6$var$vaultView.classList.remove('hidden');
        $e3ba92ab3b2980d6$var$searchInput.placeholder = "Search Vault...";
        $e3ba92ab3b2980d6$var$filterItems($e3ba92ab3b2980d6$var$searchInput.value);
    } else if (tab === 'cards') {
        $e3ba92ab3b2980d6$var$tabCards.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-500 border-b-2 border-emerald-500 transition-colors";
        $e3ba92ab3b2980d6$var$vaultView.classList.remove('hidden');
        $e3ba92ab3b2980d6$var$searchInput.placeholder = "Search Cards...";
        $e3ba92ab3b2980d6$var$filterItems($e3ba92ab3b2980d6$var$searchInput.value);
    } else {
        $e3ba92ab3b2980d6$var$tabSections.className = "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 border-b-2 border-blue-500 transition-colors";
        $e3ba92ab3b2980d6$var$sectionsView.classList.remove('hidden');
        $e3ba92ab3b2980d6$var$renderSections();
    }
}
function $e3ba92ab3b2980d6$var$createListItem(item, isRecent = false) {
    const div = document.createElement('div');
    // Highlight if selected
    const isSelected = $e3ba92ab3b2980d6$var$selectedItem && $e3ba92ab3b2980d6$var$selectedItem.id === item.id;
    const bgClass = isSelected ? "bg-blue-900/40 border-l-2 border-blue-500" : "hover:bg-[#333] border-l-2 border-transparent";
    div.className = `flex items-center group gap-3 p-3 rounded-r cursor-pointer transition-colors ${bgClass}`;
    // Icon
    let iconHTML = `<div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">${(item.title || "?")[0].toUpperCase()}</div>`;
    if (item.type === 'financial-card') {
        const cardColor = item.item_metadata?.cardColor || '#10b981' // default emerald
        ;
        iconHTML = `<div class="w-8 h-8 rounded-lg flex items-center justify-center text-lg text-white shrink-0 shadow-sm" style="background-color: ${cardColor}; border: 1px solid rgba(255,255,255,0.1)">\u{1F4B3}</div>`;
    }
    div.innerHTML = `
        ${iconHTML}
        <div class="overflow-hidden flex-1">
            <div class="text-sm font-medium text-gray-200 truncate">${item.title || "Untitled"}</div>
            <div class="text-xs text-gray-500 truncate">${item.type === 'financial-card' ? item.item_metadata?.cardNumber ? "\u2022\u2022\u2022\u2022 " + item.item_metadata.cardNumber.slice(-4) : 'Card' : item.username || ""}</div>
        </div>
        <div class="flex items-center gap-1 shrink-0">
            ${item.type === 'financial-card' && item.item_metadata?.cardNumber ? `
                <button class="list-copy-fin-btn p-1.5 hover:bg-[#444] rounded text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" data-value="${item.item_metadata.cardNumber}" title="Copy Card Number">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
            ` : ''}
            ${isRecent ? `
                <div class="${item.type === 'financial-card' ? 'hidden group-hover:hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity">
                    <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                </div>` : ''}
        </div>
    `;
    // Stop propagation for the copy button so it doesn't select the item
    const copyBtn = div.querySelector('.list-copy-fin-btn');
    if (copyBtn) copyBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        navigator.clipboard.writeText(copyBtn.dataset.value);
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `<svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        setTimeout(()=>{
            if (copyBtn) copyBtn.innerHTML = originalHTML;
        }, 1500);
    });
    div.addEventListener('click', ()=>{
        $e3ba92ab3b2980d6$var$selectItem(item);
        if (isRecent) $e3ba92ab3b2980d6$var$launchItem(item);
    });
    return div;
}
// -- Selection & Views --
function $e3ba92ab3b2980d6$var$selectItem(item, shouldSave = true) {
    $e3ba92ab3b2980d6$var$selectedItem = item;
    if (shouldSave) chrome.storage.local.set({
        lastSelectedItemId: item.id
    });
    // Re-render list to update selection highlight
    $e3ba92ab3b2980d6$var$filterItems($e3ba92ab3b2980d6$var$searchInput.value);
    // Show Details
    $e3ba92ab3b2980d6$var$renderDetailView(item);
}
function $e3ba92ab3b2980d6$var$renderDetailView(item) {
    $e3ba92ab3b2980d6$var$emptyState.classList.add('hidden');
    $e3ba92ab3b2980d6$var$editForm.classList.add('hidden');
    $e3ba92ab3b2980d6$var$detailView.classList.remove('hidden');
    // Populate Fields
    $e3ba92ab3b2980d6$var$viewTitle.textContent = item.title || "Untitled";
    if (item.type === 'financial-card') {
        const cardColor = item.item_metadata?.cardColor || '#10b981';
        $e3ba92ab3b2980d6$var$viewIcon.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl" style="background-color: ${cardColor}; color: white; border-radius: inherit;">\u{1F4B3}</div>`;
        $e3ba92ab3b2980d6$var$viewIcon.style.backgroundColor = 'transparent';
    } else {
        $e3ba92ab3b2980d6$var$viewIcon.textContent = (item.title || "?")[0].toUpperCase();
        $e3ba92ab3b2980d6$var$viewIcon.style.backgroundColor = '' // CSS default
        ;
    }
    $e3ba92ab3b2980d6$var$viewUsername.textContent = item.username || "---";
    $e3ba92ab3b2980d6$var$viewPassword.textContent = item.password // Will be blurred via CSS
    ;
    $e3ba92ab3b2980d6$var$viewWebsite.textContent = item.website || "---";
    $e3ba92ab3b2980d6$var$viewNotes.textContent = item.notes || "No notes.";
    // Reset password blur
    $e3ba92ab3b2980d6$var$viewPassword.classList.add('blur-[4px]');
    // Update Favorite Icon (basic visual toggle for now)
    if (item.is_favorite) $e3ba92ab3b2980d6$var$viewFavBtn.classList.add('text-yellow-500');
    else $e3ba92ab3b2980d6$var$viewFavBtn.classList.remove('text-yellow-500');
    // Hide auto-fill, website, and password if financial card (unless they have values/website)
    const manualFillBtn = document.getElementById('manual-fill-btn');
    const passField = $e3ba92ab3b2980d6$var$viewPassword.parentElement.parentElement;
    if (item.type === 'financial-card') {
        if (!item.website) manualFillBtn.parentElement.parentElement.classList.add('hidden');
        else manualFillBtn.parentElement.parentElement.classList.remove('hidden');
        passField.classList.add('hidden');
    } else {
        manualFillBtn.parentElement.parentElement.classList.remove('hidden');
        passField.classList.remove('hidden');
    }
    // Custom Fields
    const customFieldsContainer = document.getElementById('view-custom-fields-container');
    const customFieldsList = document.getElementById('custom-fields-list');
    const customFields = item.item_metadata?.customFields || [];
    if (customFields.length > 0) {
        customFieldsContainer.classList.remove('hidden');
        customFieldsList.innerHTML = "";
        customFields.forEach((field)=>{
            const fieldDiv = document.createElement('div');
            fieldDiv.className = "group";
            const isSensitive = field.type === 'password' || field.type === 'pin' || field.type === 'hidden';
            const displayValue = isSensitive ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : field.value || "---";
            const fieldId = `custom-${field.id}`;
            fieldDiv.innerHTML = `
                <label class="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">${field.label}</label>
                <div class="flex items-center justify-between text-gray-200 text-sm py-1 border-b border-[#333] group-hover:border-gray-500 transition-colors">
                    <span id="${fieldId}" class="${isSensitive ? 'tracking-widest' : 'truncate'} select-all mr-2">${displayValue}</span>
                    <div class="flex gap-1 shrink-0">
                        ${isSensitive ? `
                            <button class="toggle-custom-btn text-gray-500 hover:text-white p-1" data-id="${field.id}" data-value="${field.value}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                        ` : ''}
                        <button class="copy-custom-btn text-gray-500 hover:text-white p-1" data-value="${field.value}">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        </button>
                    </div>
                </div>
            `;
            customFieldsList.appendChild(fieldDiv);
        });
        // Add Listeners for custom field buttons
        customFieldsList.querySelectorAll('.toggle-custom-btn').forEach((btn)=>{
            btn.addEventListener('click', ()=>{
                const span = document.getElementById(`custom-${btn.dataset.id}`);
                const val = btn.dataset.value;
                if (span.textContent === "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022") {
                    span.textContent = val;
                    span.classList.remove('tracking-widest');
                    span.classList.add('bg-blue-600', 'px-1', 'rounded', 'text-white', 'font-medium');
                } else {
                    span.textContent = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
                    span.classList.add('tracking-widest');
                    span.classList.remove('bg-blue-600', 'px-1', 'rounded', 'font-medium');
                }
            });
        });
        customFieldsList.querySelectorAll('.copy-custom-btn').forEach((btn)=>{
            btn.addEventListener('click', ()=>{
                navigator.clipboard.writeText(btn.dataset.value);
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                setTimeout(()=>btn.innerHTML = originalHTML, 1500);
            });
        });
    } else customFieldsContainer.classList.add('hidden');
    // Financial Card Fields
    const financialFieldsContainer = document.getElementById('view-financial-fields-container');
    const financialFieldsList = document.getElementById('financial-fields-list');
    if (item.type === 'financial-card') {
        financialFieldsContainer.classList.remove('hidden');
        financialFieldsList.innerHTML = "";
        const metadata = item.item_metadata || {};
        const fields = [
            {
                label: "Card Number",
                value: metadata.cardNumber
            },
            {
                label: "Card Holder",
                value: metadata.name
            },
            {
                label: "Expiration",
                value: metadata.expiry
            },
            {
                label: "CVV",
                value: metadata.cvv,
                sensitive: true
            }
        ];
        fields.forEach((field)=>{
            if (field.value) {
                const fieldDiv = document.createElement('div');
                fieldDiv.className = "group";
                const displayValue = field.sensitive ? "\u2022\u2022\u2022" : field.value;
                const fieldId = `fin-${field.label.replace(/\s/g, '-')}`;
                fieldDiv.innerHTML = `
                    <label class="block text-[10px] text-gray-500 uppercase font-bold mb-0.5">${field.label}</label>
                    <div class="flex items-center justify-between text-gray-200 text-sm py-1 border-b border-[#333] group-hover:border-gray-500 transition-colors">
                        <span id="${fieldId}" class="${field.sensitive ? 'tracking-widest' : 'truncate'} select-all mr-2 font-mono scrollbar-hide overflow-x-auto whitespace-nowrap">${displayValue}</span>
                        <div class="flex gap-1 shrink-0">
                            ${field.sensitive ? `
                                <button class="toggle-fin-btn text-gray-500 hover:text-white p-1" data-id="${fieldId}" data-value="${field.value}">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                </button>
                            ` : ''}
                            <button class="copy-fin-btn text-gray-500 hover:text-white p-1" data-value="${field.value}">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            </button>
                        </div>
                    </div>
                `;
                financialFieldsList.appendChild(fieldDiv);
            }
        });
        // Listeners for financial field buttons
        financialFieldsList.querySelectorAll('.toggle-fin-btn').forEach((btn)=>{
            btn.addEventListener('click', ()=>{
                const span = document.getElementById(btn.dataset.id);
                if (span.textContent === "\u2022\u2022\u2022") {
                    span.textContent = btn.dataset.value;
                    span.classList.remove('tracking-widest');
                } else {
                    span.textContent = "\u2022\u2022\u2022";
                    span.classList.add('tracking-widest');
                }
            });
        });
        financialFieldsList.querySelectorAll('.copy-fin-btn').forEach((btn)=>{
            btn.addEventListener('click', ()=>{
                navigator.clipboard.writeText(btn.dataset.value);
                const originalHTML = btn.innerHTML;
                btn.innerHTML = `<svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                setTimeout(()=>{
                    if (btn) btn.innerHTML = originalHTML;
                }, 1500);
            });
        });
    } else financialFieldsContainer.classList.add('hidden');
}
function $e3ba92ab3b2980d6$var$renderEditForm(item = null) {
    $e3ba92ab3b2980d6$var$emptyState.classList.add('hidden');
    $e3ba92ab3b2980d6$var$detailView.classList.add('hidden');
    $e3ba92ab3b2980d6$var$editForm.classList.remove('hidden');
    if (item) {
        document.getElementById('form-title').textContent = "Edit Item";
        $e3ba92ab3b2980d6$var$editId.value = item.id;
        $e3ba92ab3b2980d6$var$editTitle.value = item.title || "";
        $e3ba92ab3b2980d6$var$editUsername.value = item.username || "";
        $e3ba92ab3b2980d6$var$editPassword.value = item.password || "";
        $e3ba92ab3b2980d6$var$editWebsite.value = item.website || "";
        $e3ba92ab3b2980d6$var$editCategory.value = item.category || "General";
        $e3ba92ab3b2980d6$var$editFolder.value = item.folder_id || "";
        $e3ba92ab3b2980d6$var$editNotes.value = item.notes || "";
        // Handle Picture
        const picture = item.picture || item.item_metadata?.picture;
        if (picture) $e3ba92ab3b2980d6$var$editPicturePreview.innerHTML = `<img src="${picture}" class="w-full h-full object-contain">`;
        else $e3ba92ab3b2980d6$var$editPicturePreview.innerHTML = `<span class="text-[10px] text-gray-500">No Image</span>`;
        // Handle Custom Fields
        $e3ba92ab3b2980d6$var$currentCustomFields = JSON.parse(JSON.stringify(item.item_metadata?.customFields || []));
        $e3ba92ab3b2980d6$var$renderEditCustomFields();
        $e3ba92ab3b2980d6$var$deleteBtn.classList.remove('hidden');
    } else {
        document.getElementById('form-title').textContent = "New Item";
        $e3ba92ab3b2980d6$var$editId.value = "";
        $e3ba92ab3b2980d6$var$editTitle.value = "";
        $e3ba92ab3b2980d6$var$editUsername.value = "";
        $e3ba92ab3b2980d6$var$editPassword.value = "";
        $e3ba92ab3b2980d6$var$editWebsite.value = "";
        $e3ba92ab3b2980d6$var$editCategory.value = "General";
        $e3ba92ab3b2980d6$var$editFolder.value = "";
        $e3ba92ab3b2980d6$var$editNotes.value = "";
        $e3ba92ab3b2980d6$var$editPicturePreview.innerHTML = `<span class="text-[10px] text-gray-500">No Image</span>`;
        $e3ba92ab3b2980d6$var$currentCustomFields = [];
        $e3ba92ab3b2980d6$var$renderEditCustomFields();
        $e3ba92ab3b2980d6$var$deleteBtn.classList.add('hidden') // Can't delete what doesn't exist yet
        ;
    }
}
function $e3ba92ab3b2980d6$var$renderEditCustomFields() {
    $e3ba92ab3b2980d6$var$editCustomFieldsList.innerHTML = "";
    $e3ba92ab3b2980d6$var$currentCustomFields.forEach((field, index)=>{
        const div = document.createElement('div');
        div.className = "space-y-1 p-2 bg-[#252526] rounded border border-[#333]";
        div.innerHTML = `
            <div class="flex items-center justify-between gap-2">
                <input type="text" value="${field.label}" placeholder="Label" class="bg-transparent border-b border-gray-700 text-[10px] text-blue-400 font-medium py-0 focus:outline-none focus:border-blue-500 w-1/2 custom-label" data-index="${index}">
                <button type="button" class="text-gray-500 hover:text-red-400 delete-custom-field" data-index="${index}">
                   <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <input type="text" value="${field.value}" placeholder="Value" class="w-full bg-[#333] border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500 custom-value" data-index="${index}">
        `;
        $e3ba92ab3b2980d6$var$editCustomFieldsList.appendChild(div);
    });
    // Listeners for custom field edits
    $e3ba92ab3b2980d6$var$editCustomFieldsList.querySelectorAll('.custom-label').forEach((input)=>{
        input.addEventListener('change', (e)=>{
            $e3ba92ab3b2980d6$var$currentCustomFields[e.target.dataset.index].label = e.target.value;
        });
    });
    $e3ba92ab3b2980d6$var$editCustomFieldsList.querySelectorAll('.custom-value').forEach((input)=>{
        input.addEventListener('change', (e)=>{
            $e3ba92ab3b2980d6$var$currentCustomFields[e.target.dataset.index].value = e.target.value;
        });
    });
    $e3ba92ab3b2980d6$var$editCustomFieldsList.querySelectorAll('.delete-custom-field').forEach((btn)=>{
        btn.addEventListener('click', (e)=>{
            const index = btn.closest('button').dataset.index;
            $e3ba92ab3b2980d6$var$currentCustomFields.splice(index, 1);
            $e3ba92ab3b2980d6$var$renderEditCustomFields();
        });
    });
}
// Picture upload handling
$e3ba92ab3b2980d6$var$editPictureInput.addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event)=>{
            const base64String = event.target.result;
            $e3ba92ab3b2980d6$var$editPicturePreview.innerHTML = `<img src="${base64String}" class="w-full h-full object-contain">`;
        // Store temporarily in a property or data attribute? 
        // We'll pull from preview's img src on save.
        };
        reader.readAsDataURL(file);
    }
});
// Add custom field
$e3ba92ab3b2980d6$var$addCustomFieldBtn.addEventListener('click', ()=>{
    $e3ba92ab3b2980d6$var$currentCustomFields.push({
        id: Math.random().toString(36).substring(2, 9),
        label: "New Field",
        value: "",
        type: "text"
    });
    $e3ba92ab3b2980d6$var$renderEditCustomFields();
});
// -- Actions --
// Save
$e3ba92ab3b2980d6$var$saveBtn.addEventListener('click', async ()=>{
    const isNew = !$e3ba92ab3b2980d6$var$editId.value;
    // Get picture from preview
    const pictureImg = $e3ba92ab3b2980d6$var$editPicturePreview.querySelector('img');
    const pictureData = pictureImg ? pictureImg.src : null;
    // Prepare metadata
    const existingMetadata = $e3ba92ab3b2980d6$var$selectedItem?.item_metadata || {};
    const item_metadata = {
        ...existingMetadata,
        customFields: $e3ba92ab3b2980d6$var$currentCustomFields,
        picture: pictureData
    };
    const payload = {
        user_id: $e3ba92ab3b2980d6$var$user.id,
        title: $e3ba92ab3b2980d6$var$editTitle.value,
        username: $e3ba92ab3b2980d6$var$editUsername.value,
        password: $e3ba92ab3b2980d6$var$editPassword.value,
        website: $e3ba92ab3b2980d6$var$editWebsite.value,
        category: $e3ba92ab3b2980d6$var$editCategory.value,
        folder_id: $e3ba92ab3b2980d6$var$editFolder.value || null,
        notes: $e3ba92ab3b2980d6$var$editNotes.value,
        type: 'password',
        item_metadata: item_metadata
    };
    // Optimistic Update
    $e3ba92ab3b2980d6$var$saveBtn.textContent = "Saving...";
    $e3ba92ab3b2980d6$var$saveBtn.disabled = true;
    let error = null;
    let resultItem = null;
    try {
        if (isNew) {
            const { data: data, error: err } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').insert(payload).select().single();
            error = err;
            resultItem = data;
        } else {
            const { data: data, error: err } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').update(payload).eq('id', $e3ba92ab3b2980d6$var$editId.value).select().single();
            error = err;
            resultItem = data;
        }
    } catch (err) {
        console.error("Supabase error:", err);
        error = err;
    }
    $e3ba92ab3b2980d6$var$saveBtn.textContent = "Save";
    $e3ba92ab3b2980d6$var$saveBtn.disabled = false;
    if (!error && resultItem) {
        if (isNew) $e3ba92ab3b2980d6$var$allItems.unshift(resultItem) // Add to top
        ;
        else {
            const idx = $e3ba92ab3b2980d6$var$allItems.findIndex((i)=>i.id === resultItem.id);
            if (idx !== -1) $e3ba92ab3b2980d6$var$allItems[idx] = resultItem;
        }
        $e3ba92ab3b2980d6$var$cacheData($e3ba92ab3b2980d6$var$allItems) // Sync to local storage
        ;
        $e3ba92ab3b2980d6$var$selectItem(resultItem) // Go back to view
        ;
    } else {
        console.error("Save failed", error);
        alert("Failed to save item: " + (error?.message || "Unknown error"));
    }
});
// Delete
$e3ba92ab3b2980d6$var$deleteBtn.addEventListener('click', async ()=>{
    if (!confirm("Are you sure you want to delete this item?")) return;
    const id = $e3ba92ab3b2980d6$var$editId.value;
    const { error: error } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').delete().eq('id', id);
    if (!error) {
        $e3ba92ab3b2980d6$var$allItems = $e3ba92ab3b2980d6$var$allItems.filter((i)=>i.id !== id);
        $e3ba92ab3b2980d6$var$cacheData($e3ba92ab3b2980d6$var$allItems);
        $e3ba92ab3b2980d6$var$selectedItem = null;
        $e3ba92ab3b2980d6$var$filterItems($e3ba92ab3b2980d6$var$searchInput.value);
        $e3ba92ab3b2980d6$var$emptyState.classList.remove('hidden');
        $e3ba92ab3b2980d6$var$editForm.classList.add('hidden');
    }
});
// Copy Utils
document.querySelectorAll('.copy-btn').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
        const targetId = btn.getAttribute('data-target');
        const el = document.getElementById(targetId);
        if (el) {
            navigator.clipboard.writeText(el.textContent);
            // Visual feedback
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
            setTimeout(()=>btn.innerHTML = originalHTML, 1500);
        }
    });
});
// Launch
$e3ba92ab3b2980d6$var$launchBtn.addEventListener('click', async ()=>{
    if ($e3ba92ab3b2980d6$var$selectedItem) $e3ba92ab3b2980d6$var$launchItem($e3ba92ab3b2980d6$var$selectedItem);
});
async function $e3ba92ab3b2980d6$var$launchItem(item) {
    if (item.website) {
        let url = item.website;
        if (!url.startsWith('http')) url = 'https://' + url;
        $e3ba92ab3b2980d6$var$addToRecents(item);
        // Open tab
        chrome.tabs.create({
            url: url
        }, (tab)=>{
        // We can try to proactively fill, but content script usually handles onLoad check.
        // But we can also send an explicit message to be safe.
        });
    }
}
function $e3ba92ab3b2980d6$var$addToRecents(item) {
    // Remove if already exists
    $e3ba92ab3b2980d6$var$recentItemsIds = $e3ba92ab3b2980d6$var$recentItemsIds.filter((id)=>id !== item.id);
    // Add to front
    $e3ba92ab3b2980d6$var$recentItemsIds.unshift(item.id);
    // Limit to 25
    if ($e3ba92ab3b2980d6$var$recentItemsIds.length > 25) $e3ba92ab3b2980d6$var$recentItemsIds = $e3ba92ab3b2980d6$var$recentItemsIds.slice(0, 25);
    // Save
    chrome.storage.local.set({
        recentItemsIds: $e3ba92ab3b2980d6$var$recentItemsIds
    });
}
// Toggle Password Visibility
$e3ba92ab3b2980d6$var$togglePassBtn.addEventListener('click', ()=>{
    if ($e3ba92ab3b2980d6$var$viewPassword.classList.contains('blur-[4px]')) {
        $e3ba92ab3b2980d6$var$viewPassword.classList.remove('blur-[4px]');
        $e3ba92ab3b2980d6$var$viewPassword.classList.add('bg-blue-600', 'px-1', 'rounded', 'text-white', 'font-medium');
    } else {
        $e3ba92ab3b2980d6$var$viewPassword.classList.add('blur-[4px]');
        $e3ba92ab3b2980d6$var$viewPassword.classList.remove('bg-blue-600', 'px-1', 'rounded', 'font-medium');
    }
});
// Navigation & Toolbar
$e3ba92ab3b2980d6$var$addBtn.addEventListener('click', ()=>$e3ba92ab3b2980d6$var$renderEditForm(null));
$e3ba92ab3b2980d6$var$editBtn.addEventListener('click', ()=>$e3ba92ab3b2980d6$var$renderEditForm($e3ba92ab3b2980d6$var$selectedItem));
$e3ba92ab3b2980d6$var$cancelEditBtn.addEventListener('click', ()=>{
    if ($e3ba92ab3b2980d6$var$selectedItem) $e3ba92ab3b2980d6$var$renderDetailView($e3ba92ab3b2980d6$var$selectedItem);
    else {
        $e3ba92ab3b2980d6$var$editForm.classList.add('hidden');
        $e3ba92ab3b2980d6$var$emptyState.classList.remove('hidden');
    }
});
// Search
$e3ba92ab3b2980d6$var$searchInput.addEventListener('input', (e)=>{
    if (e.target.value !== "") {
        $e3ba92ab3b2980d6$var$currentMode = 'all';
        $e3ba92ab3b2980d6$var$switchSidebarTab('vault');
    }
    $e3ba92ab3b2980d6$var$filterItems(e.target.value);
});
// Tabs
$e3ba92ab3b2980d6$var$tabVault.addEventListener('click', ()=>$e3ba92ab3b2980d6$var$switchSidebarTab('vault'));
$e3ba92ab3b2980d6$var$tabCards.addEventListener('click', ()=>$e3ba92ab3b2980d6$var$switchSidebarTab('cards'));
$e3ba92ab3b2980d6$var$tabSections.addEventListener('click', ()=>$e3ba92ab3b2980d6$var$switchSidebarTab('sections'));
// Matches
async function $e3ba92ab3b2980d6$var$checkForMatches() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    if (tab && tab.url) {
        let currentDomain = "";
        try {
            currentDomain = new URL(tab.url).hostname.toLowerCase().replace(/^www\./, '');
        } catch (e) {
            console.log("Invalid tab URL", tab.url);
            return;
        }
        console.log("Checking matches for domain:", currentDomain);
        // Find ALL matches
        const matches = $e3ba92ab3b2980d6$var$allItems.filter((item)=>{
            if (!item.website) return false;
            // Normalize stored website
            let storedDomain = item.website.toLowerCase().trim();
            // Remove protocol
            storedDomain = storedDomain.replace(/^https?:\/\//, '');
            // Remove www.
            storedDomain = storedDomain.replace(/^www\./, '');
            // Remove path/query
            storedDomain = storedDomain.split('/')[0].split('?')[0].split(':')[0];
            // Check if domains match (or are subdomains)
            const isMatch = currentDomain === storedDomain || currentDomain.endsWith('.' + storedDomain);
            return isMatch;
        });
        if (matches.length > 0) {
            console.log("Found matches:", matches);
            // 1. Filter the list to show only matches
            $e3ba92ab3b2980d6$var$filteredItems = matches;
            $e3ba92ab3b2980d6$var$itemsList.innerHTML = "";
            $e3ba92ab3b2980d6$var$filteredItems.forEach((item)=>{
                const el = $e3ba92ab3b2980d6$var$createListItem(item);
                $e3ba92ab3b2980d6$var$itemsList.appendChild(el);
            });
            // 2. Auto-select the first one
            $e3ba92ab3b2980d6$var$selectItem(matches[0]);
        }
    }
}
// Manual Auto-Fill Button
const $e3ba92ab3b2980d6$var$manualFillBtn = document.getElementById('manual-fill-btn');
if ($e3ba92ab3b2980d6$var$manualFillBtn) $e3ba92ab3b2980d6$var$manualFillBtn.addEventListener('click', async ()=>{
    if (!$e3ba92ab3b2980d6$var$selectedItem) {
        console.warn("SecureLifeHub: No item selected for Auto-Fill");
        return;
    }
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });
    if (!tab) {
        console.error("SecureLifeHub: No active tab found");
        return;
    }
    // Visual feedback: show "Filling..."
    const originalHTML = $e3ba92ab3b2980d6$var$manualFillBtn.innerHTML;
    $e3ba92ab3b2980d6$var$manualFillBtn.textContent = 'Filling...';
    $e3ba92ab3b2980d6$var$manualFillBtn.disabled = true;
    const doFill = ()=>{
        chrome.tabs.sendMessage(tab.id, {
            action: 'fill',
            data: $e3ba92ab3b2980d6$var$selectedItem
        }, (response)=>{
            if (chrome.runtime.lastError) console.warn("SecureLifeHub: sendMessage error:", chrome.runtime.lastError.message);
        });
        setTimeout(()=>{
            $e3ba92ab3b2980d6$var$manualFillBtn.innerHTML = originalHTML;
            $e3ba92ab3b2980d6$var$manualFillBtn.disabled = false;
        }, 800);
    };
    // First try sending directly; if that fails, inject the content script and retry
    chrome.tabs.sendMessage(tab.id, {
        action: 'ping'
    }, (response)=>{
        if (chrome.runtime.lastError || !response) {
            // Content script not loaded — inject it first
            console.log("SecureLifeHub: Content script not detected, injecting...");
            chrome.scripting.executeScript({
                target: {
                    tabId: tab.id
                },
                files: [
                    'src/content.js'
                ]
            }, ()=>{
                if (chrome.runtime.lastError) {
                    console.error("SecureLifeHub: Script injection failed:", chrome.runtime.lastError.message);
                    $e3ba92ab3b2980d6$var$manualFillBtn.innerHTML = originalHTML;
                    $e3ba92ab3b2980d6$var$manualFillBtn.disabled = false;
                    return;
                }
                // Give the script a moment to initialise before filling
                setTimeout(doFill, 300);
            });
        } else doFill();
    });
});
// -- Menu & Auth --
// Menu Toggle
$e3ba92ab3b2980d6$var$menuBtn.addEventListener('click', ()=>{
    const isHidden = $e3ba92ab3b2980d6$var$menuDropdown.classList.contains('hidden');
    if (isHidden) {
        $e3ba92ab3b2980d6$var$menuDropdown.classList.remove('hidden');
        $e3ba92ab3b2980d6$var$menuOverlay.classList.remove('hidden');
    } else $e3ba92ab3b2980d6$var$closeMenu();
});
$e3ba92ab3b2980d6$var$menuOverlay.addEventListener('click', $e3ba92ab3b2980d6$var$closeMenu);
function $e3ba92ab3b2980d6$var$closeMenu() {
    $e3ba92ab3b2980d6$var$menuDropdown.classList.add('hidden');
    $e3ba92ab3b2980d6$var$menuOverlay.classList.add('hidden');
}
// Recents Menu Button
document.getElementById('menu-recents-btn').addEventListener('click', ()=>{
    $e3ba92ab3b2980d6$var$switchSidebarTab('vault');
    $e3ba92ab3b2980d6$var$searchInput.value = "";
    $e3ba92ab3b2980d6$var$filterItems("");
    $e3ba92ab3b2980d6$var$closeMenu();
});
// Login
const $e3ba92ab3b2980d6$var$loginForm = document.getElementById('login-form');
$e3ba92ab3b2980d6$var$loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data: data, error: error } = await $e3ba92ab3b2980d6$var$supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        document.getElementById('error-msg').textContent = error.message;
        document.getElementById('error-msg').classList.remove('hidden');
    } else {
        $e3ba92ab3b2980d6$var$user = data.user;
        $e3ba92ab3b2980d6$var$showVault();
    }
});
// Logout
document.getElementById('logout-menu-btn').addEventListener('click', async ()=>{
    await $e3ba92ab3b2980d6$var$supabase.auth.signOut();
    // Sync logout to web app via background script
    chrome.runtime.sendMessage({
        type: 'LOGOUT_SESSIONS'
    });
    // Clear Local Cache
    chrome.storage.local.clear();
    // Attempt global logout?
    // We can't easily access the main app's LocalStorage from here due to domain isolation.
    // But we can open a logout URL in the background.
    $e3ba92ab3b2980d6$var$user = null;
    $e3ba92ab3b2980d6$var$showLogin();
    $e3ba92ab3b2980d6$var$closeMenu();
});
// Auto-Fill Toggle (Menu Item)
document.getElementById('autofill-toggle-btn').addEventListener('click', async ()=>{
    await $e3ba92ab3b2980d6$var$toggleAutoFill();
});
async function $e3ba92ab3b2980d6$var$toggleAutoFill(forceState = null) {
    if (!$e3ba92ab3b2980d6$var$preferenceItem) {
        // Create defaults if missing
        const { data: data } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').insert({
            user_id: $e3ba92ab3b2980d6$var$user.id,
            title: "[SYSTEM] User Preferences",
            type: "note",
            item_metadata: {
                auto_fill_enabled: true
            }
        }).select().single();
        $e3ba92ab3b2980d6$var$preferenceItem = data;
    } else {
        const newState = forceState !== null ? forceState : !($e3ba92ab3b2980d6$var$preferenceItem.item_metadata?.auto_fill_enabled === true);
        $e3ba92ab3b2980d6$var$preferenceItem.item_metadata = {
            ...$e3ba92ab3b2980d6$var$preferenceItem.item_metadata,
            auto_fill_enabled: newState
        };
        // UI Update
        $e3ba92ab3b2980d6$var$updateAutoFillBadge(newState);
        // Cache Update
        chrome.storage.local.set({
            autoFillEnabled: newState
        });
        // DB Update
        await $e3ba92ab3b2980d6$var$supabase.from('vault_items').update({
            item_metadata: $e3ba92ab3b2980d6$var$preferenceItem.item_metadata
        }).eq('id', $e3ba92ab3b2980d6$var$preferenceItem.id);
    }
}
// Open Web Vault
document.getElementById('open-vault-btn').addEventListener('click', ()=>{
    $e3ba92ab3b2980d6$var$openInWebVault("dashboard");
});
// Open Financial Cards
document.getElementById('open-financial-btn').addEventListener('click', ()=>{
    $e3ba92ab3b2980d6$var$openInWebVault("financial-cards");
});
// Generate Password (Simple)
$e3ba92ab3b2980d6$var$genPassBtn.addEventListener('click', ()=>{
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for(let i = 0; i < 16; i++)pass += chars.charAt(Math.floor(Math.random() * chars.length));
    $e3ba92ab3b2980d6$var$editPassword.value = pass;
});
// Toggle Favorite
$e3ba92ab3b2980d6$var$viewFavBtn.addEventListener('click', async ()=>{
    if (!$e3ba92ab3b2980d6$var$selectedItem) return;
    const newFavStatus = !$e3ba92ab3b2980d6$var$selectedItem.is_favorite;
    $e3ba92ab3b2980d6$var$selectedItem.is_favorite = newFavStatus;
    // Optimistic UI update
    if (newFavStatus) $e3ba92ab3b2980d6$var$viewFavBtn.classList.add('text-yellow-500');
    else $e3ba92ab3b2980d6$var$viewFavBtn.classList.remove('text-yellow-500');
    // Database Update
    const { error: error } = await $e3ba92ab3b2980d6$var$supabase.from('vault_items').update({
        is_favorite: newFavStatus
    }).eq('id', $e3ba92ab3b2980d6$var$selectedItem.id);
    if (error) {
        console.error("Failed to update favorite", error);
        // Revert UI
        $e3ba92ab3b2980d6$var$selectedItem.is_favorite = !newFavStatus;
        $e3ba92ab3b2980d6$var$renderDetailView($e3ba92ab3b2980d6$var$selectedItem);
        alert("Failed to update favorite status");
    } else {
        // Update local cache
        const idx = $e3ba92ab3b2980d6$var$allItems.findIndex((i)=>i.id === $e3ba92ab3b2980d6$var$selectedItem.id);
        if (idx !== -1) $e3ba92ab3b2980d6$var$allItems[idx] = $e3ba92ab3b2980d6$var$selectedItem;
        $e3ba92ab3b2980d6$var$cacheData($e3ba92ab3b2980d6$var$allItems);
    }
});
// Extension Reload
document.getElementById('extension-reload-btn').addEventListener('click', ()=>{
    chrome.runtime.reload();
});
// Sync Now (Menu Item)
const $e3ba92ab3b2980d6$var$quickSyncBtn = document.getElementById('quick-sync');
if ($e3ba92ab3b2980d6$var$quickSyncBtn) $e3ba92ab3b2980d6$var$quickSyncBtn.addEventListener('click', async ()=>{
    const originalHTML = $e3ba92ab3b2980d6$var$quickSyncBtn.innerHTML;
    $e3ba92ab3b2980d6$var$quickSyncBtn.innerHTML = `
            <div class="flex items-center gap-3">
                <svg class="w-5 h-5 animate-spin text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Syncing Data...</span>
            </div>
        `;
    try {
        await $e3ba92ab3b2980d6$var$fetchItems();
        $e3ba92ab3b2980d6$var$quickSyncBtn.innerHTML = `
                <div class="flex items-center gap-3 text-green-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Sync Complete!</span>
                </div>
            `;
    } catch (e) {
        console.error("Sync error:", e);
        $e3ba92ab3b2980d6$var$quickSyncBtn.innerHTML = `
                <div class="flex items-center gap-3 text-red-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <span>Sync Failed</span>
                </div>
            `;
    }
    setTimeout(()=>{
        $e3ba92ab3b2980d6$var$quickSyncBtn.innerHTML = originalHTML;
        $e3ba92ab3b2980d6$var$closeMenu();
    }, 1500);
});
$e3ba92ab3b2980d6$var$init();


