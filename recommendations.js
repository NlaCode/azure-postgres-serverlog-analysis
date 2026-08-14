var recommendationRules = [
  {
    "id": "deadlock",
    "title": "Concorrência e Deadlocks",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('deadlock detected') > 0;",
    "description": "Foram detectados deadlocks. Isso ocorre quando duas transações se bloqueiam mutuamente. Revise a ordem em que as transações na aplicação adquirem locks (ex: SELECT FOR UPDATE ou UPDATEs em múltiplas tabelas).",
    "reference": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
  },
  {
    "id": "no_space_left",
    "title": "Disco Lotado (No space left)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('No space left') > 0;",
    "description": "O servidor ficou sem espaço em disco para escrever logs, WALs ou dados temporários. Escale o storage imediatamente no portal do Azure ou limpe logs/arquivos temporários.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-compute-storage#storage"
  },
  {
    "id": "high_connection_churn",
    "title": "Alto Churn de Conexões",
    "severity": "WARNING",
    "condition": "return stats.conn > 100 && (stats.conn / (stats.disconn || 1) > 0.8) && (stats.conn / (stats.disconn || 1) < 1.2);",
    "description": "Há um alto volume de conexões sendo abertas e fechadas repetidamente (semelhante número de conexões e desconexões). Isso consome muita CPU (processos fork). Implemente um connection pooler como PgBouncer.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-pgbouncer"
  },
  {
    "id": "max_connections_reached",
    "title": "Limite de Conexões Atingido",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('remaining connection slots are reserved') > 0 || errorPatternCount('too many connections') > 0;",
    "description": "O banco de dados rejeitou novas conexões pois o limite (max_connections) foi atingido. Investigue sessões ociosas ou configure um connection pooler (PgBouncer).",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-MAX-CONNECTIONS"
  },
  {
    "id": "password_auth_failed",
    "title": "Falha de Autenticação",
    "severity": "WARNING",
    "condition": "return errorPatternCount('password authentication failed') > 0;",
    "description": "Houve tentativas de login com senha incorreta. Verifique se alguma aplicação está usando credenciais desatualizadas ou rotacionadas. Picos repentinos podem indicar tentativa de brute-force.",
    "reference": "https://www.postgresql.org/docs/current/client-authentication-problems.html"
  },
  {
    "id": "statement_timeout",
    "title": "Queries Excedendo Timeout",
    "severity": "WARNING",
    "condition": "return errorPatternCount('canceling statement due to statement timeout') > 0;",
    "description": "Algumas queries foram abortadas por ultrapassarem o `statement_timeout`. Verifique a aba 'Log Finder' filtrando por 'duration' ou ative o `pg_stat_statements` para identificar e otimizar queries lentas.",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT"
  },
  {
    "id": "ssl_unexpected_eof",
    "title": "Instabilidade de Rede (SSL EOF)",
    "severity": "INFO",
    "condition": "return errorPatternCount('unexpected eof while reading') > 0;",
    "description": "Foram observados erros de fechamento abrupto de conexão SSL. Isso geralmente indica timeouts na rede entre a aplicação e o banco, ou que a aplicação foi reiniciada de forma forçada.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-tls-ssl"
  },
  {
    "id": "datadog_permission",
    "title": "Permissão Negada - Agente Datadog",
    "severity": "WARNING",
    "condition": "return (errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') > 0) || errorPatternCount('schema \"datadog\" does not exist') > 0;",
    "description": "Erros de permissão ou schema inexistente envolvendo o agente do Datadog. Certifique-se de que o usuário 'datadog' tenha recebido os privilégios corretos (ex: pg_monitor) e que o schema 'datadog' com a função explain_statement exista no banco de dados monitorado.",
    "reference": "https://docs.datadoghq.com/integrations/postgres/?tab=host"
  },
  {
    "id": "generic_permission_denied",
    "title": "Permissão Negada (Permission Denied)",
    "severity": "WARNING",
    "condition": "return errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') === 0;",
    "description": "Erros de 'permission denied' para usuários da aplicação. Verifique se o GRANT apropriado foi dado na tabela, view ou função afetada. Sugestão de comando: GRANT SELECT, INSERT, UPDATE ON nome_da_tabela TO nome_do_usuario;",
    "reference": "https://www.postgresql.org/docs/current/sql-grant.html"
  }
];
