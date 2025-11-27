# Endpoints de agregación recomendados

Este archivo propone endpoints y ejemplos tanto para Django (DRF) como para Express (Node) para devolver series agregadas de visitas por hora/día/mes.

Convención propuesta (GET):

- `GET /api/visitas/aggregated/?period=day&year=2025&month=11&day=26`
  - `period` puede ser `hour`|`day`|`month` o `today`|`month`|`year`.
  - Opciones: `year`, `month`, `day` según el periodo.

Respuesta recomendada (JSON):

```
{ "labels": ["00","01","02",...], "data": [0,2,1,...] }
```

Alternativa (cada item):

```
{ "results": [{"label":"01","value":3}, ...] }
```

----------

Ejemplo (Django REST Framework)

```py
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from django.db.models.functions import TruncHour, TruncDay, TruncMonth

@api_view(['GET'])
def visitas_aggregated(request):
    period = request.GET.get('period', 'month')
    year = request.GET.get('year')
    month = request.GET.get('month')
    day = request.GET.get('day')

    qs = Visita.objects.all()
    if year:
        qs = qs.filter(fecha_visita__year=int(year))
    if month:
        qs = qs.filter(fecha_visita__month=int(month))
    if day:
        qs = qs.filter(fecha_visita__day=int(day))

    if period in ('hour', 'today'):
        # Agrupar por hora en una fecha dada
        # Asegúrate que fecha_visita sea DateTimeField
        grouped = qs.annotate(hour=TruncHour('fecha_visita')).values('hour').annotate(count=Count('id')).order_by('hour')
        labels = [g['hour'].strftime('%H:00') for g in grouped]
        data = [g['count'] for g in grouped]
        return Response({'labels': labels, 'data': data})

    if period in ('day','month'):
        grouped = qs.annotate(day=TruncDay('fecha_visita')).values('day').annotate(count=Count('id')).order_by('day')
        labels = [g['day'].strftime('%d') for g in grouped]
        data = [g['count'] for g in grouped]
        return Response({'labels': labels, 'data': data})

    # period == 'year' => agrupar por mes
    grouped = qs.annotate(month=TruncMonth('fecha_visita')).values('month').annotate(count=Count('id')).order_by('month')
    labels = [g['month'].strftime('%b') for g in grouped]
    data = [g['count'] for g in grouped]
    return Response({'labels': labels, 'data': data})
```

Ejemplo (Express + Sequelize / raw SQL) - pseudo:

```js
// route: GET /api/visitas/aggregated
app.get('/api/visitas/aggregated', async (req, res) => {
  const { period='month', year, month, day } = req.query;
  // Construye query SQL agregando por HOUR/DATE/MONTH según DB
  // Ejemplo para MySQL:
  let sql;
  if (period === 'hour') {
    sql = `SELECT HOUR(fecha_visita) as label, COUNT(*) as value FROM visitas WHERE DATE(fecha_visita)=? GROUP BY HOUR(fecha_visita) ORDER BY label`;
    const params = [/* la fecha como YYYY-MM-DD */];
    const rows = await db.query(sql, { replacements: params, type: QueryTypes.SELECT });
    return res.json({ results: rows.map(r => ({ label: String(r.label).padStart(2,'0'), value: r.value })) });
  }
  // Similar para day/month
});
```

Notas:
- Asegúrate de indexar `fecha_visita` en la BD si vas a agrupar/filtrar frecuentemente.
- Normaliza la respuesta para que el frontend (que ya contiene un fallback) pueda consumirla.
