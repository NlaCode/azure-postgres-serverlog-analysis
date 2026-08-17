var recommendationRules = [
  {
    "id": "deadlock",
    "title": "Concorrência e Deadlocks",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('deadlock detected') > 0;",
    "patterns": ["deadlock detected"],
    "description": "Foram detectados deadlocks. Isso ocorre quando duas transações se bloqueiam mutuamente. Revise a ordem em que as transações na aplicação adquirem locks (ex: SELECT FOR UPDATE ou UPDATEs em múltiplas tabelas).",
    "reference": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS"
  },
  {
    "id": "no_space_left",
    "title": "Disco Lotado (No space left)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('No space left') > 0;",
    "patterns": ["No space left"],
    "description": "O servidor ficou sem espaço em disco para escrever logs, WALs ou dados temporários. Escale o storage imediatamente no portal do Azure ou limpe logs/arquivos temporários.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-compute-storage#storage"
  },
  {
    "id": "high_connection_churn",
    "title": "Alto Churn de Conexões",
    "severity": "WARNING",
    "condition": "return stats.conn > 100 && (stats.conn / (stats.disconn || 1) > 0.8) && (stats.conn / (stats.disconn || 1) < 1.2);",
    "patterns": [],
    "description": "Há um alto volume de conexões sendo abertas e fechadas repetidamente (semelhante número de conexões e desconexões). Isso consome muita CPU (processos fork). Implemente um connection pooler como PgBouncer.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-pgbouncer"
  },
  {
    "id": "max_connections_reached",
    "title": "Limite de Conexões Atingido",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('remaining connection slots are reserved') > 0 || errorPatternCount('too many connections') > 0;",
    "patterns": ["remaining connection slots are reserved", "too many connections"],
    "description": "O banco de dados rejeitou novas conexões pois o limite (max_connections) foi atingido. Investigue sessões ociosas ou configure um connection pooler (PgBouncer).",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-MAX-CONNECTIONS"
  },
  {
    "id": "password_auth_failed",
    "title": "Falha de Autenticação",
    "severity": "WARNING",
    "condition": "return errorPatternCount('password authentication failed') > 0;",
    "patterns": ["password authentication failed"],
    "description": "Houve tentativas de login com senha incorreta. Verifique se alguma aplicação está usando credenciais desatualizadas ou rotacionadas. Picos repentinos podem indicar tentativa de brute-force.",
    "reference": "https://www.postgresql.org/docs/current/client-authentication-problems.html"
  },
  {
    "id": "statement_timeout",
    "title": "Queries Excedendo Timeout",
    "severity": "WARNING",
    "condition": "return errorPatternCount('canceling statement due to statement timeout') > 0;",
    "patterns": ["canceling statement due to statement timeout"],
    "description": "Algumas queries foram abortadas por ultrapassarem o `statement_timeout`. Verifique a aba 'Log Finder' filtrando por 'duration' ou ative o `pg_stat_statements` para identificar e otimizar queries lentas.",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT"
  },
  {
    "id": "ssl_unexpected_eof",
    "title": "Instabilidade de Rede (SSL EOF)",
    "severity": "INFO",
    "condition": "return errorPatternCount('unexpected eof while reading') > 0;",
    "patterns": ["unexpected eof while reading"],
    "description": "Foram observados erros de fechamento abrupto de conexão SSL. Isso geralmente indica timeouts na rede entre a aplicação e o banco, ou que a aplicação foi reiniciada de forma forçada.",
    "reference": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-tls-ssl"
  },
  {
    "id": "datadog_permission",
    "title": "Permissão Negada - Agente Datadog",
    "severity": "WARNING",
    "condition": "return (errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') > 0) || errorPatternCount('schema \"datadog\" does not exist') > 0;",
    "patterns": ["permission denied", "datadog"],
    "description": "Erros de permissão ou schema inexistente envolvendo o agente do Datadog. Certifique-se de que o usuário 'datadog' tenha recebido os privilégios corretos (ex: pg_monitor) e que o schema 'datadog' com a função explain_statement exista no banco de dados monitorado.",
    "reference": "https://docs.datadoghq.com/integrations/postgres/?tab=host"
  },
  {
    "id": "generic_permission_denied",
    "title": "Permissão Negada (Permission Denied)",
    "severity": "WARNING",
    "condition": "return errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') === 0;",
    "patterns": ["permission denied"],
    "description": "Erros de 'permission denied' para usuários da aplicação. Verifique se o GRANT apropriado foi dado na tabela, view ou função afetada. Sugestão de comando: GRANT SELECT, INSERT, UPDATE ON nome_da_tabela TO nome_do_usuario;",
    "reference": "https://www.postgresql.org/docs/current/sql-grant.html"
  },
  {
    "id": "idle_session_timeout",
    "title": "Conexões Encerradas por Inatividade",
    "severity": "WARNING",
    "condition": "return errorPatternCount('terminating connection due to idle-session timeout') > 0;",
    "patterns": ["idle-session timeout"],
    "description": "Sessões inativas foram terminadas por excederem o tempo limite `idle_session_timeout`. Isso pode ocorrer se a aplicação retém conexões abertas sem uso. Revise o gerenciamento de conexões do seu app, garanta que transações/conexões não essenciais sejam finalizadas, ou ajuste o valor deste parâmetro na configuração do PostgreSQL se necessário.",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-SESSION-TIMEOUT"
  },
  {
    "id": "not_null_violation",
    "title": "Violação de Constraint (Not-Null)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('violates not-null constraint') > 0;",
    "patterns": ["violates not-null constraint"],
    "description": "A aplicação tentou inserir ou atualizar um registro enviando um valor nulo (NULL) para uma coluna que é obrigatória (não permite nulos). Revise o código da aplicação ou a query para garantir que os campos obrigatórios, como IDs de relacionamento, estejam sendo preenchidos corretamente.",
    "reference": "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-NOT-NULL"
  },
  {
    "id": "datadog_multiquery_cursor",
    "title": "Erro Datadog: Multi-query cursor",
    "severity": "INFO",
    "condition": "return errorPatternCount('cannot open multi-query plan as cursor') > 0;",
    "patterns": ["cannot open multi-query plan as cursor"],
    "description": "O agente do Datadog (ou outra ferramenta de monitoramento) tentou rodar um 'EXPLAIN' em uma instrução contendo múltiplas queries separadas por ponto-e-vírgula (;). O PostgreSQL não suporta a execução de múltiplas queries dentro de um cursor. Trata-se de um erro da coleta de métricas e geralmente pode ser ignorado, ou contornado desabilitando a funcionalidade de EXPLAIN no agente do Datadog para batches de queries.",
    "reference": "https://docs.datadoghq.com/database_monitoring/setup_postgres/troubleshooting/"
  },
  {
    "id": "relation_not_exist",
    "title": "Tabela ou Relação Inexistente",
    "severity": "CRITICAL",
    "condition": "var keys = Object.keys(errorGroups); for (var i = 0; i < keys.length; i++) { var p = errorGroups[keys[i]].pattern; if (p.indexOf('relation') !== -1 && p.indexOf('does not exist') !== -1) return true; } return false;",
    "patterns": ["does not exist"],
    "description": "Uma query tentou acessar uma tabela ou view que não existe. Isso pode ocorrer devido a uma falha/ausência na execução de uma migration no banco de dados, conexão com o banco de dados/schema incorreto, ou erro de digitação no código da aplicação.",
    "reference": "https://www.postgresql.org/docs/current/sql-createtable.html"
  },
  {
    "id": "connection_client_lost",
    "title": "Conexão com o Cliente Perdida",
    "severity": "WARNING",
    "condition": "return errorPatternCount('connection to client lost') > 0;",
    "patterns": ["connection to client lost"],
    "description": "O banco de dados detectou que a conexão TCP foi encerrada abruptamente pelo cliente. Isso geralmente é causado por: a aplicação foi encerrada/crachou subitamente (ex: Out of Memory no pod da aplicação), problemas de rede (firewall/timeout), ou o timeout interno da aplicação esgotou e ela dropou a conexão sem encerrá-la amigavelmente.",
    "reference": "https://www.postgresql.org/docs/current/runtime-config-logging.html#GUC-LOG-DISCONNECTIONS"
  }
];
