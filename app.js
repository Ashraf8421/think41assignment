const express = require("express");
const app = express();


app.get("/spreadsheet/:spreadsheet_id/cells/:cell_id/dependencies", async(req,res)=>{
    const {spreadsheet_id,cell_id} = req.params;
    try{
        const dependencies = await CellDepependency.find({
            spreadsheet_id:spreadsheet_id,
            from_cell_id : cell_id
        });
        const dependenciesCellIds= dependencies.map( dep => 
            dep.to_cell_id
        );
        res.json({
            cell_id,
            dependencies : dependenciesCellIds
        });
    }catch(error){
        res.status(500).json({error: " Error fetching dependencies."});
    }
});