import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const firebaseHelper = require('firebase-functions-helper')
import * as express from 'express';
import * as bodyParser from 'body-parser';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();
const main = express();

const pacientesBasicDataCollection = 'pacientesBasicData';

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded(
    { 
        extended: false 
    }
));

/**
 * Exportando las funciones dentro de esta api
 */
export const patientsApi = functions.https.onRequest(main);

// CRUD de la api para el ingreso de los datos del paciente

/**
 * ================ RUTAS PARA DATOS BASICOS DEL PACIENTE
 */
/**
 * Metodo que inserta por primera vez, los datos medicos del paciente,
 * en caso de exito envia mensaje con status success, en caso de fallo con estatus de error
 */
app.post('/paciente/basic', (req, res) => {
    /**
     * guardamos:
     *  paciente_id
     *  estatura,
     *  peso
     *  genero_conviccion
     */
    if(req.body != null) {
        firebaseHelper.firestore
            .createNewDocumentWithID(
                db, 
                pacientesBasicDataCollection, 
                // id del documento
                req.body.paciente_id,
                {
                    'estatura': req.body.estatura,
                    'peso': req.body.peso,
                    'genero_conviccion': req.body.genero_conviccion
                }
            )
            .then((doc:object) => 
            res.send({
                status: 'success',
                message:'Datos del paciente han sido guardados'
            }))
            .catch((error:any) =>{
                res.send({status: 'error', message: 'Datos mal estructurados'});
            });
    }
    res.send({status: 'error', message: 'Datos mal estructurados'})
});

/**
 * Metodo que actualiza los datos basicos del paciente
 * en caso de exito envia mensaje con status success, en caso de fallo con estatus de error
 */
app.patch('/paciente/basic/:patientId', (req, res) => {
    firebaseHelper.firestore
        .updateDocument(
            db,
            pacientesBasicDataCollection,
            req.params.patientId,
            req.body
        )
        .then((success:any) =>{
            res.send({
                status: 'success',
                message: 'Datos del paciente actualizados'
            });
        })
        .catch((error:any)=>{
            res.send({status: 'error', message: 'Datos mal estructurados'})
        });
});

/**
 * Metodo que devuelve los datos basicos del paciente determinado con su id
 * en caso de exito envia un status 200  el documento que se consiguio
 */
app.get('/paciente/basic/:patientId', (req, res) => {
    firebaseHelper.firestore
        .getDocument(
            db,
            pacientesBasicDataCollection,
            req.params.patientId
        )
        .then((document:object) => {
            res
                .status(200)
                .send(document);
        })
});

/**
 * Metodo que permite eliminar los datos basicos de un paciente determinado
 * en caso de exito envia mensaje con status success, en caso de fallo con estatus de error
 */
app.delete('/paciente/basic/:patientId', (req, res) => {
    firebaseHelper.firestore
        .deleteDocument(
            db,
            pacientesBasicDataCollection,
            req.params.patientId
        )
        .then((sucess:any) =>{
            if(sucess.status){
                res.send({
                    status: 'sucess',
                    message: 'Tus datos basicos han sido reseteados'
                });
            } else {
                res.send({
                    status: 'error',
                    message: 'Error al tratar de eliminar tus datos'
                });
            }
        })
        
        
});