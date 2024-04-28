const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Configurar Express para servir archivos estáticos
app.use(express.static('public'));

// Mapeo de códigos de series a nombres de monedas
const seriesMap = {
    BRL: 'F072.BRL.USD.N.O.D',
    CLP: 'F073.TCO.PRE.Z.D',
    SAR: 'F072.SAR.USD.N.O.D',
    ARS: 'F072.ARS.USD.N.O.D',
    AUD: 'F072.AUD.USD.N.O.D',
    BSP: 'F072.BSP.USD.N.O.D',
    BMD: 'F072.BMD.USD.N.O.D',
    BOL: 'F072.BOL.USD.N.O.D',
    CAD: 'F072.CAD.USD.N.O.D',
    QAR: 'F072.QAR.USD.N.O.D',
    CNY: 'F072.CNY.USD.N.O.D',
    COP: 'F072.COP.USD.N.O.D',
    KRW: 'F072.KRW.USD.N.O.D',
    CRC: 'F072.CRC.USD.N.O.D',
    CUP: 'F072.CUP.USD.N.O.D',
    DEG: 'F072.DEG.USD.N.O.D',
    DKK: 'F072.DKK.USD.N.O.D',
    EGP: 'F072.EGP.USD.N.O.D',
    AED: 'F072.AED.USD.N.O.D',
    EUR: 'F072.EUR.USD.N.O.D',
    PHP: 'F072.PHP.USD.N.O.D',
    FJD: 'F072.FJD.USD.N.O.D',
    XPF: 'F072.XPF.USD.N.O.D',
    GTQ: 'F072.GTQ.USD.N.O.D',
    HKD: 'F072.HKD.USD.N.O.D',
    HUF: 'F072.HUF.USD.N.O.D',
    INR: 'F072.INR.USD.N.O.D',
    IDR: 'F072.IDR.USD.N.O.D',
    IRR: 'F072.IRR.USD.N.O.D',
    ISK: 'F072.ISK.USD.N.O.D',
    KYD: 'F072.KYD.USD.N.O.D',
    ILS: 'F072.ILS.USD.N.O.D',
    JPY: 'F072.JPY.USD.N.O.D',
    KZT: 'F072.KZT.USD.N.O.D',
    MYR: 'F072.MYR.USD.N.O.D',
    MAD: 'F072.MAD.USD.N.O.D',
    MXN: 'F072.MXN.USD.N.O.D',
    NOK: 'F072.NOK.USD.N.O.D',
    NZD: 'F072.NZD.USD.N.O.D',
    PKR: 'F072.PKR.USD.N.O.D',
    PAB: 'F072.PAB.USD.N.O.D',
    PYG: 'F072.PYG.USD.N.O.D',
    PEN: 'F072.PEN.USD.N.O.D',
    PLN: 'F072.PLN.USD.N.O.D',
    GBP: 'F072.GBP.USD.N.O.D',
    CZK: 'F072.CZK.USD.N.O.D',
    DOP: 'F072.DOP.USD.N.O.D',
    RON: 'F072.RON.USD.N.O.D',
    RUR: 'F072.RUR.USD.N.O.D',
    SGD: 'F072.SGD.USD.N.O.D',
    ZAR: 'F072.ZAR.USD.N.O.D',
    SEK: 'F072.SEK.USD.N.O.D',
    CHF: 'F072.CHF.USD.N.O.D',
    THB: 'F072.THB.USD.N.O.D',
    TWD: 'F072.TWD.USD.N.O.D',
    TRY: 'F072.TRY.USD.N.O.D',
    UAH: 'F072.UAH.USD.N.O.D',
    UYU: 'F072.UYU.USD.N.O.D',
    VEB: 'F072.VEB.USD.N.O.D',
    VND: 'F072.VND.USD.N.O.D',
};

// Servir el archivo HTML estático
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para obtener las tasas de cambio y realizar la conversión
app.get('/tasas-cambio', async (req, res) => {
    try {
        const user = 'vi.fariasr@duocuc.cl';
        const pass = 'Testing123';
        const { monedaOrigen, monedaDestino, cantidad } = req.query;

        // Verificar si las monedas son válidas
        const monedasValidas = Object.keys(seriesMap);
        if (!monedasValidas.includes(monedaOrigen) || !monedasValidas.includes(monedaDestino)) {
            return res.status(400).json({ error: 'Divisas no válidas' });
        }

        // Verificar si la cantidad es un número válido
        if (isNaN(parseFloat(cantidad))) {
            return res.status(400).json({ error: 'La cantidad no es un número válido' });
        }

        // Obtener tasas de cambio desde la API del Banco Central
        const apiUrlOrigen = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=${user}&pass=${pass}&timeseries=${seriesMap[monedaOrigen]}&function=GetSeries`;
        const apiUrlDestino = `https://si3.bcentral.cl/SieteRestWS/SieteRestWS.ashx?user=${user}&pass=${pass}&timeseries=${seriesMap[monedaDestino]}&function=GetSeries`;

        const [responseOrigen, responseDestino] = await Promise.all([
            axios.get(apiUrlOrigen),
            axios.get(apiUrlDestino)
        ]);

        // Extraer las tasas de cambio de las respuestas de la API
        const tasaOrigen = parseFloat(responseOrigen.data.Series.Obs[responseOrigen.data.Series.Obs.length - 1].value);
        const tasaDestino = parseFloat(responseDestino.data.Series.Obs[responseDestino.data.Series.Obs.length - 1].value);

        // Calcular la tasa de conversión
        const tasaConversion = tasaDestino / tasaOrigen;

        // Devolver la tasa de conversión al frontend
        res.status(200).json({ tasaConversion });
    } catch (error) {
        console.error('Error al obtener las tasas de cambio:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
