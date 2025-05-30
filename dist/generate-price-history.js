"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var MONGODB_URI = 'mongodb://localhost:27017/linkcompra';
var DAYS_OF_HISTORY = 180; // 6 meses de histórico
var STORES = ['Amazon', 'Shopee'];
var VARIATION_RANGE = 0.15; // 15% de variação máxima
function generatePriceHistory() {
    return __awaiter(this, void 0, void 0, function () {
        var client, db, products, _i, products_1, product, prices, basePrice, history_1, endDate, i, date, _a, STORES_1, store, variation, price, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    client = null;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, 10, 13]);
                    console.log('Conectando ao MongoDB...');
                    return [4 /*yield*/, mongodb_1.MongoClient.connect(MONGODB_URI)];
                case 2:
                    client = _b.sent();
                    db = client.db();
                    console.log('Conectado com sucesso!');
                    // Limpa os dados antigos
                    console.log('Limpando históricos antigos...');
                    return [4 /*yield*/, db.collection('pricehistories').deleteMany({})];
                case 3:
                    _b.sent();
                    console.log('Históricos antigos removidos.');
                    console.log('Buscando produtos...');
                    return [4 /*yield*/, db.collection('products').find({}).toArray()];
                case 4:
                    products = _b.sent();
                    console.log("Encontrados ".concat(products.length, " produtos."));
                    _i = 0, products_1 = products;
                    _b.label = 5;
                case 5:
                    if (!(_i < products_1.length)) return [3 /*break*/, 8];
                    product = products_1[_i];
                    prices = product.prices || [];
                    basePrice = prices.length > 0
                        ? Math.min.apply(Math, prices.map(function (p) { return p.price; })) : 999.99;
                    console.log("Gerando hist\u00F3rico para produto ".concat(product.title || 'Sem título', " (EAN: ").concat(product.ean, ")"));
                    history_1 = [];
                    endDate = new Date('2025-05-29');
                    for (i = 0; i < DAYS_OF_HISTORY; i++) {
                        date = new Date(endDate);
                        date.setDate(date.getDate() - i);
                        for (_a = 0, STORES_1 = STORES; _a < STORES_1.length; _a++) {
                            store = STORES_1[_a];
                            variation = (Math.random() - 0.5) * 2 * VARIATION_RANGE;
                            price = Math.round(basePrice * (1 + variation));
                            history_1.push({
                                date: date,
                                price: price,
                                store: store
                            });
                        }
                    }
                    // Salva o histórico no banco
                    console.log("Salvando hist\u00F3rico para produto ".concat(product.ean, "..."));
                    return [4 /*yield*/, db.collection('pricehistories').updateOne({ ean: product.ean }, {
                            $set: {
                                productId: product._id,
                                ean: product.ean,
                                history: history_1
                            }
                        }, { upsert: true })];
                case 6:
                    result = _b.sent();
                    console.log("Hist\u00F3rico salvo. Modificados: ".concat(result.modifiedCount, ", Inseridos: ").concat(result.upsertedCount));
                    console.log("Hist\u00F3rico gerado para produto ".concat(product.title || 'Sem título'));
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('Histórico de preços gerado com sucesso!');
                    return [3 /*break*/, 13];
                case 9:
                    error_1 = _b.sent();
                    console.error('Erro:', error_1);
                    return [3 /*break*/, 13];
                case 10:
                    if (!client) return [3 /*break*/, 12];
                    return [4 /*yield*/, client.close()];
                case 11:
                    _b.sent();
                    console.log('Conexão com MongoDB fechada.');
                    _b.label = 12;
                case 12:
                    process.exit(0);
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
generatePriceHistory().catch(function (error) {
    console.error('Erro:', error);
    process.exit(1);
});
