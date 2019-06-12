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

var serviceAccount = require("./mediworld-backend-firebase-adminsdk-jc9pf-e5e3ee322f.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mediworld-backend.firebaseio.com"
  },functions.config().firebase);

// llamando la llave para insertar datos en firebase


const db = admin.firestore();

const app = express();
const main = express();

const pacientesBasicDataCollection = 'pacientesBasicData';
const personalDataCollection = 'personalDataCollection';
const pacientesAlAnDataCollection = 'pacientesAlergiasyAntecedentesData';
const publicDataCollection = 'patientPublicData';

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
    const body:any = req.body;
    if(body != null) {
        firebaseHelper.firestore
            .createDocumentWithID(
                db, 
                pacientesBasicDataCollection, 
                // id del documento
                body.paciente_id,
                {
                    'estatura': body.estatura,
                    'peso': body.peso,
                    'genero_conviccion': body.genero_conviccion
                }
            )
            .then((response:any) => {
                res.send({status: 'success', message: 'Datos ingresados correctamente'})
            })
            .catch((error:any) =>{
                res.send({status: 'error', message: 'Datos mal estructurados'});
            });
    } else {
        res.send({status: 'error', message: 'No se recibió ningún dato'});
    }
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
        .checkDocumentExists(
            db,
            pacientesBasicDataCollection,
            req.params.patientId
        )
        .then((document:any) => {
            if(document.exists){
                res
                .status(200)
                .send(document.data);
            } else {
                res
                .status(404)
                .send({status: "error",
                message: "Paciente aun no tiene datos personales"});
            }
        });
});

/**
 * Metodo que permite eliminar los datos basicos de un paciente determinado
 * en caso de exito envia mensaje con status success, en caso de fallo con estatus de error
 */
app.delete('/paciente/basic/:patientId', (req, res) => {
    firebaseHelper.firestore
        .checkDocumentExists(
            db,
            pacientesBasicDataCollection,
            req.params.patientId
        )
        .then((document:any) => {
            if(document.exists){
                firebaseHelper.firestore
                    .deleteDocument(
                        db,
                        pacientesBasicDataCollection,
                        req.params.patientId
                    )
                    .then((sucess:any) =>{
                        if(sucess.status){
                            res.send({
                                status: 'success',
                                message: 'Tus datos basicos han sido reseteados'
                            });
                        } else {
                            res.send({
                                status: 'error',
                                message: 'Error al tratar de eliminar tus datos básicos'
                            });
                        }
                    });
            } else {
                res
                .status(404)
                .send({status: "error", 
                message: "Paciente aun no tiene datos básicos"});
            }
        })
});


/**
 * ============== RUTAS PARA TRABAJAR CON DATOS PERSONALES DEL PACIENTE
 */

 /**
  * Metodo para insertar datos personales de un paciente
  */
 app.post('/paciente/personal', (req, res) => {
    const body = req.body;
    if(body != null) {
        firebaseHelper.firestore
           .createDocumentWithID(
               db,
               personalDataCollection,
               body.paciente_id,
               {
                   "telefono": body.telefono,
                   "tipo_de_sangre": body.tipo_de_sangre,
                   "fuma": body.fuma,
                   "drogas": body.drogas,
                   "bebidas_alcoholicas": body.bebidas_alcoholicas,
                   // TODO: proteger este dato con criptografia
                   "num_seguro_social": body.num_seguro_social,
                   "seguro_medico": body.seguro_medico,
                   "internado_hospitalario": body.internado_hospitalario,
                   "cirugia": body.cirugia,
                   "actividad_fisica": body.actividad_fisica,
                   "antecedentes_enfermedades_importantes": body.antecedentes_enfermedades_importantes
               }
           )
           .then((response:any) => {
               res
                   .status(201)
                   .send({
                       status: 'success',
                       message: 'Datos personales ingresados con exito'
                   });
           })
           .catch((error:any) => {
               res
               .send({
                   status: 'error',
                   message: 'Lo datos no se pudieron ingresar, puede que no esten bien estructurados'
               });
           })
    } else {
        res
           .send({
               status: 'error',
               message: 'Ocurrión un error tratando de insertar los datos personales'
           });
    }
});

/**
 * Metodo para actualizar los datos personales de un paciente existente
 */
app.patch('/paciente/personal/:pacienteId', (req, res) => {
   firebaseHelper.firestore
       .checkDocumentExists(
           db,
           personalDataCollection,
           req.params.pacienteId
       )
       .then((document:any) => {
           if(document.exists) {
               firebaseHelper.firestore
                   .updateDocument(
                       db,
                       personalDataCollection,
                       req.params.pacienteId,
                       req.body
                   )
                   .then((success:any) => {
                       res.send({
                           status:'success',
                           messsage: 'Se han actualizado los datos con exito'
                       });
                   })
                   .catch((error:any) => {
                       res.send({
                           status: 'error', 
                           message: 'Existió un error al intentar actualizar los datos'
                       });
                   });
           } else {
               res
                   .status(404)
                   .send({
                       status: 'error',
                       message: 'Paciente aun no tiene datos personales'
                   });
           }
       });
});

/**
 * Metodo para conseguir los datos de un paciente determinado
 */
app.get('/paciente/personal/:pacienteId', (req, res) => {
    firebaseHelper.firestore
       .checkDocumentExists(
           db, 
           personalDataCollection,
           req.params.pacienteId
       )
       .then((document:any) => {
           if(document.exists) {
               res
               .status(200)
               .send(document.data);
           } else {
               res
                   .status(404)
                   .send({
                       status: 'error',
                       message: 'El paciente aún no tiene datos personales'
                   });
           }
       });
});

/**
 * Metodo para eliminar los datos personales de un paciente existente
 */
app.delete('/paciente/personal/:pacienteId', (req, res) => {
    firebaseHelper.firestore
       .checkDocumentExists(
           db,
           personalDataCollection,
           req.params.pacienteId
       )
       .then((document:any) =>{
           if(document.exists) {
               firebaseHelper.firestore
                   .deleteDocument(
                       db,
                       personalDataCollection,
                       req.params.pacienteId
                   )
                   .then((success:any) => {
                       if(success.status) {
                           res.send({
                               status: 'success',
                               message: 'Se han reseteado tus datos personales'
                           });
                       } else {
                           res.send({
                               status: 'error',
                               message: 'Existió un error al intentar resetear tus datos personales'
                           });
                       }
                   });
           } else {
               res
                   .status(404)
                   .send({
                       status: 'error',
                       message: 'Paciente aun no tiene datos personales'
                   });
           }
       });
});



// CRUD de la api para el ingreso de los datos del paciente

/**
 * ================ RUTAS PARA DATOS BASICOS DEL PACIENTE
 */

 /**
  * Metodo para insertar nuevos datos de un paciente, como id del documento
  * a insertar se ocupa el id del paciente.
  */
 app.post('/paciente/alergiasyantecedentes', (req, res) => {
    const body = req.body;
    if(body != null) {
        firebaseHelper.firestore
            .createDocumentWithID(
                db,
                pacientesAlAnDataCollection,
                body.paciente_id,
                {
                    "alergias": body.alergias,
                    "antecedentes": body.antecedentes
                }
            )
            .then((response:any) => {
                res
                .status(201).send({
                    status: "success",
                    message: "Datos ingresados correctamente"
                })
            })
            .catch((error:any) => {
                res.send({
                    status: 'error', 
                    message: 'Datos mal estructurados'
                });
            });
    } else {
        res.send({
            status: "error",
            message: "Datos inexistentes"
        });
    }
});

/**
 * Metodo para actualizar parcial o completamente los datos de un paciente
 * dado su id
 */
app.patch("/paciente/alergiasyantecedentes/:pacienteId", (req, res) => {
    firebaseHelper.firestore
        .updateDocument(
            db,
            pacientesAlAnDataCollection,
            req.params.pacienteId,
            req.body
        )
        .then((success:any) =>{
            res.send({
                status: 'success',
                message: 'Datos del paciente actualizados'
            });
        })
        .catch((error:any) => {
            res.send({
                status: 'error', 
                message: 'Existió un error al intentar actualizar los datos'
            })
        });
});

/**
 * Metodo para obtener los datos de un paciente determinado en base a su id,
 * y si es que este existe
 */
app.get("/paciente/alergiasyantecedentes/:pacienteId", (req, res) => {
    firebaseHelper.firestore
        .checkDocumentExists(
            db,
            pacientesAlAnDataCollection,
            req.params.pacienteId
        )
        .then((document:any) => {
            if(document.exists) {
                res
                    .status(200)
                    .send(document.data);
            } else {
                res
                    .status(404)
                    .send({
                        status: "error",
                        message: "Paciente aun no tiene datos de alergias y antecedentes"
                    });
            }
        });
});

/**
 * Metodo para eliminar los datos de alergias y antecedentes de un paciente
 * determinado
 */
app.delete("/paciente/alergiasyantecedentes/:pacienteId", (req, res) => {
    firebaseHelper.firestore
        .checkDocumentExists(
            db,
            pacientesAlAnDataCollection,
            req.params.pacienteId
        )
        .then((document:any) => {
            if(document.exists){
                firebaseHelper.firestore
                    .deleteDocument(
                        db,
                        pacientesAlAnDataCollection,
                        req.params.pacienteId
                    )
                    .then((success:any) => {
                        if(success.status) {
                            res.send({
                                status: 'success',
                                message: 'Tus datos de alergias y antecedentes han sido reseteados'
                            });
                        } else {
                            res
                                .send({
                                    status: 'error',
                                    message: 'Error al tratar de resetear tus datos de alergias y antecedentes'
                                });
                        }
                    });
            } else {
                res
                    .status(404)
                    .send('Paciente aun no tiene datos de alergias y antecedentes');
            }
        });
});


// inicio de CRUD y RUTAS PARA MOSTRAR LOS DATOS PUBLICOS DEL PACIENTE

/**
 * Metodo para agregar nuevos datos publicos de un determinado paciente
 */
app.post('/paciente/public', (req, res) => {
	const body = req.body;
	if(body != null){
	firebaseHelper.firestore
		.createDocumentWithID(
			db,
			publicDataCollection,
			body.paciente_id,
			{
				'nombre': body.nombre,
				'email': body.email,
				'telefono': body.telefono,
				'tipo_sangre': body.tipo_sangre,
				'pais': body.pais,
				'alergias': body.alergias
			}
		)
		.then((response:any) => {
			res
				.status(201)
				.send({
					status: 'success',
					message: 'Se han configurado correctamente tus datos publicos'
				});
		})
		.catch((error:any) => {
			res
				.send({
					status: 'error',
					'message': 'Tus datos publicos no pudieron ser configurados'
				});
		});
	} else {
		res
			.send({
				status: 'error',
				message: 'No existen datos para poner publico'
			});
	}
});

/**
 * Metodo para conseguir los datos publicos de un determinado paciente
 */
app.get('/paciente/public/:pacienteId', (req, res) => {
    firebaseHelper.firestore
        .checkDocumentExists(
            db,
            publicDataCollection,
            req.params.pacienteId
        )
        .then((document:any) => {
            if(document.exists){
                res
                    .status(200)
                    .send(document.data);
            } else {
                res
                    .status(404)
                    .send({
                        status: 'error',
                        message:'Los datos publicos que buscas no se encuentran'
                    });
            }
        });
});

/**
 * Metodo para actualizar los datos publicos de un paciente
 */
app.patch("/paciente/public/:pacienteId", (req, res) => {
    firebaseHelper.firestore
        .updateDocument(
            db,
            publicDataCollection,
            req.params.pacienteId,
            req.body
        )
        .then((suceess:any) => {
            res
                .send({
                    status: 'success',
                    message: 'Personalización de datos publicos han sido actualizados'
                });
        })
        .catch((error:any) => {
            res
                .send({
                    status: 'success',
                    message: 'Personalización de datos publicos no ha podido realizarse'
                });
        });
});

/**
 * Metodo para eliminar los datos publicos de un paciente
 */
app.delete("/paciente/public/:pacienteId", (req, res) => {
    firebaseHelper.firestore
        .checkDocumentExists(
            db,
            publicDataCollection,
            req.params.pacienteId
        )
        .then((document:any) => {
            if(document.exists){
                firebaseHelper.firestore
                    .deleteDocument(
                        db,
                        publicDataCollection,
                        req.params.pacienteId
                    )
                    .then((success:any) => {
                        if(success.status) {
                            res.send({
                                status: 'success',
                                message: 'Tus configuracion de datos publicos han sido reseteados'
                            });
                        } else {
                            res
                                .send({
                                    status: 'error',
                                    message: 'Error al tratar de resetear tu configuracion de datos publicos'
                                });
                        }
                    });
            } else {
                res
                    .status(404)
                    .send('No existen datos de configuracion aun');
            }
        });

});