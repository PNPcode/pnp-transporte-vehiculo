using Microsoft.AspNetCore.Mvc;
using General.Librerias.AccesoDatos;

namespace PnpDotacionCombustible.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public HomeController(ILogger<HomeController> logger, IWebHostEnvironment env, IConfiguration configuration)
    {
        _logger = logger;
        _env = env;
        _configuration = configuration;
    }


    public IActionResult Index()
    {
        ViewBag.IsDevelopment = _env.IsDevelopment();
        return View();
    }

    [HttpPost]
    public string TraerListaMenus()
    {
        try
        {
            string rpta = "";
            string user = Request.Form["data1"].ToString();
            string clave = Request.Form["data2"].ToString();
            string usuario = $"{user}|{clave}";

            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_loginXmenusTransporte", "@data", usuario);
            if (rpta == "")
            {
                _logger.LogError("dbo.usp_loginXmenusTransporte '{data}'", usuario);
                rpta = "error";
            }
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en backend:");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaGrupoBien")]
    public string TraerListaGrupoBien()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_grupo_bien", "@data", "0");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("/Home/GrabarDatosVarios")]
    public string GrabarDatosVarios()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_generico01", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Home/RecuperarRegGrupoBien")]
    public string RecuperarRegGrupoBien(string dato)
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_search_grupo_bien", "@data", dato);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaVehiculo")]
    public string TraerListaVehiculo()
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_vehiculo", "@data", "0");
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpGet("/Home/TraerListaVehiculoParam")]
    public string TraerListaVehiculoParam(string dato)
    {
        try
        {
            string rpta = "";
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_crud_vehiculo", "@data", dato);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

    [HttpPost("/Home/TraerDatosGrupoBienAyudas")]
    public string TraerDatosGrupoBienAyudas()
    {
        try
        {
            string rpta = "";
            string datos = Request.Form["data"].ToString();
            daSQL odaSQL = new daSQL(_configuration, "CNX");
            rpta = odaSQL.ejecutarComando("dbo.usp_buscar_Grupo_bien", "@data", datos);
            return rpta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al guardar la data...");
            return "error";
        }
    }

}
